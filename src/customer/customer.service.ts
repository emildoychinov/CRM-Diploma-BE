import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { Client } from 'src/client/entities/client.entity';
import { AccountStatus } from '../enums/customer-account-status.enum';
import * as bcrypt from 'bcrypt';
import { QueueService } from 'src/queue/queue.service';
import { CHANGE_STATUS_LENGTHS, DURATION_WORD_KEYS } from 'src/constants';
import { StatusDto } from 'src/customer-status/dto/status.dto';
import { MailService } from 'src/mail/mail.service';
import { MailDto } from 'src/mail/dto/mail.dto';
import { UserRequest } from 'src/interfaces/requests/user.request';
import Bull from 'bull';
import Redis from 'ioredis';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private authService: AuthService,
    private readonly queueService: QueueService,
    @Inject('REDIS')
    private readonly redis: Redis,
  ) {}

  async register(instance: any, createCustomerDto: CreateCustomerDto) {
    const { password: rawPassword, ...customerDto } = createCustomerDto;
    customerDto.client = { id: instance.client_id };
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const customer = this.customerRepository.create({
      password: hashedPassword,
      ...customerDto,
    });
    customer.account_status = AccountStatus.PENDING_ACTIVATION;
    try {
      await this.findByEmailAndClient(customer.email, customer.client.id);
    } catch (error) {
      const savedCustomer = await this.customerRepository.save(customer);

      await this.enqueueStatusChange(
        this.queueService.getQueue(`customer.${customer.id}`),
        savedCustomer,
        AccountStatus.ACTIVE,
        'initial account activation',
        CHANGE_STATUS_LENGTHS['MINUTE'],
      );

      return this.authService.constructCostumerToken(customer);
    }
    throw new Error('Customer with this email already registered under client');
  }

  async login(instance: any, loginCustomerDto: LoginCustomerDto) {
    try {
      loginCustomerDto.client = { id: instance.client_id };
      const customer = await this.findByEmailAndClient(
        loginCustomerDto.email,
        loginCustomerDto.client.id as number,
      );
      if (customer.account_status === AccountStatus.DEACTIVATED) {
        const activeJob = await this.redis.get(
          `customer.${customer.client.id}.${customer.id}.deactivationJob`,
        );
        const jobRemoved = await this.queueService.remove(
          this.queueService.getQueue(`customer.${customer.id}`),
          activeJob as string,
        );
        if (jobRemoved) {
          await this.update(customer.id, { is_admin: true }, {
            account_status: AccountStatus.ACTIVE,
          } as UpdateCustomerDto);
        }
      }
      if (await bcrypt.compare(loginCustomerDto.password, customer.password)) {
        return this.authService.constructCostumerToken(customer);
      } else {
        throw new UnauthorizedException(
          'Invalid customer credentials for client',
        );
      }
    } catch (error) {
      throw new NotFoundException(
        `Could not find user ${loginCustomerDto.email} within client ${loginCustomerDto.client.id}`,
      );
    }
  }

  async findByEmailAndClient(email: string, clientID: number) {
    return await this.customerRepository.findOneOrFail({
      where: {
        email: email,
        client: { id: clientID },
      },
      relations: ['client'],
    });
  }

  async findByEmail(email: string) {
    return await this.customerRepository.findOneOrFail({
      where: {
        email: email,
      },
      relations: ['client'],
    });
  }

  async findByIdAndClient(id: number, clientID: number) {
    return await this.customerRepository.findOneOrFail({
      where: {
        id,
        client: { id: clientID },
      },
      relations: ['client'],
    });
  }

  async findById(id: number) {
    return await this.customerRepository.findOneOrFail({
      where: {
        id,
      },
      relations: ['client'],
    });
  }

  async findCustomers(user: any) {
    return user?.is_admin
      ? this.findAll()
      : this.findAllInClient(user.client_id);
  }

  async findCustomerById(id: number, user: any) {
    return user?.is_admin
      ? this.findById(id)
      : this.findByIdAndClient(id, user.client_id);
  }

  async findCustomerByEmail(email: string, user: any) {
    return user?.is_admin
      ? this.findByEmail(email)
      : this.findByEmailAndClient(email, user.client_id);
  }

  findAllInClient(clientID: number) {
    return this.customerRepository.find({
      where: {
        client: { id: clientID },
      },
    });
  }

  findAll() {
    return this.customerRepository.find({
      relations: ['client'],
    });
  }

  async enqueueStatusChange(
    queue: Bull.Queue,
    customer: Customer,
    status: AccountStatus,
    reason: string,
    delay: number,
  ) {
    await this.queueService.add(
      queue,
      `customer.${customer.id}.changeAccountStatusProcess`,
      {
        customer,
        account_status: status,
        notes: reason,
      },
      { delay },
    );
  }

  async update(id: number, user: any, updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.findCustomerById(id, user);
      const {
        id: customerID,
        client: customerClient,
        email: customerEmail,
        ...sanitizedCustomer
      } = customer;
      if (
        updateCustomerDto.email &&
        updateCustomerDto.email !== customerEmail
      ) {
        try {
          await this.findCustomerByEmail(updateCustomerDto.email, user);
        } catch (error) {
          console.error(error);
        } finally {
          throw new Error(
            `User with email ${updateCustomerDto.email} already exists under client`,
          );
        }
      } else {
        updateCustomerDto.email = customerEmail;
      }

      const updatedCustomer = {
        id: customerID,
        client: customerClient,
        ...updateCustomerDto,
      };

      return this.customerRepository.save(updatedCustomer);
    } catch (error) {
      throw new NotFoundException(
        `Could not find user ${updateCustomerDto.email} within client`,
      );
    }
  }

  async deactivate(id: number) {
    try {
      const customer = await this.update(id, { is_admin: true }, {
        account_status: AccountStatus.DEACTIVATED,
      } as UpdateCustomerDto);

      const queue = this.queueService.getQueue(`customer.${id}`);

      await this.queueService.add(
        queue,
        `customer.${id}.sendStatusUpdateMessageProcess`,
        {
          mailDto: {
            receiver: customer.email,
            title: 'Your account has been deactivated',
            client: customer.client.name,
            reason: customer.notes,
            status: AccountStatus.DEACTIVATED,
          } as MailDto,
        },
      );

      const deactivationJob = await this.queueService.add(
        queue,
        `customer.${id}.deactivationProcess`,
        {
          customer,
          mailDto: {
            receiver: customer.email,
            client: customer.client.name,
          } as MailDto,
        },
        { delay: CHANGE_STATUS_LENGTHS['MONTH'] },
      );

      await this.redis.set(
        `customer.${customer.client.id}.${customer.id}.deactivationJob`,
        deactivationJob?.id as number,
      );

      return `Customer account ${customer.id} deactivated successfully`;
    } catch (error) {
      throw error;
    }
  }

  async ban(id: number, user: any, statusDto: StatusDto) {
    try {
      const customer = await this.update(id, user, {
        account_status: AccountStatus.BANNED,
        notes: statusDto.reason,
      } as UpdateCustomerDto);

      const queue = this.queueService.getQueue(`customer.${id}`);

      await this.queueService.add(
        queue,
        `customer.${id}.sendStatusUpdateMessageProcess`,
        {
          mailDto: {
            receiver: customer.email,
            title: 'Your account has been banned',
            client: customer.client.name,
            reason: customer.notes,
            status: AccountStatus.BANNED,
            duration: DURATION_WORD_KEYS[statusDto.duration],
          } as MailDto,
        },
      );

      await this.enqueueStatusChange(
        queue,
        customer,
        AccountStatus.PENDING_ACTIVATION,
        `Previously banned for ${statusDto.reason}`,
        CHANGE_STATUS_LENGTHS[statusDto.duration],
      );

      return `Customer ${customer.id} banned successfully`;
    } catch (error) {
      throw error;
    }
  }

  removeCustomer(id: number, user: any) {
    return user?.is_admin
      ? this.removeById(id)
      : this.removeByClientAndId(id, user.client_id);
  }

  removeByClientAndId(id: number, clientID: number) {
    return this.customerRepository.delete({
      id,
      client: {
        id: clientID,
      },
    });
  }

  removeById(id: number) {
    return this.customerRepository.delete(id);
  }
}
