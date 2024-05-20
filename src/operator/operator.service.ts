import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Client } from 'src/client/entities/client.entity';
import { Role } from 'src/roles/entities/role.entity';
import { SUPERUSER } from 'src/constants';

@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  createOperator(createOperatorDto: CreateOperatorDto, user: any) {
    return user.is_admin
      ? this.createOperatorGlobally(createOperatorDto)
      : this.createOperatorInInstance(createOperatorDto, user.client_id);
  }

  createOperatorInInstance(
    createOperatorDto: CreateOperatorDto,
    clientID: number,
  ) {
    const { client, ...sanitizedDto } = createOperatorDto;
    const operator = this.operatorRepository.create({
      client: {
        id: clientID,
      },
      ...sanitizedDto,
    });
    return this.operatorRepository.save(operator);
  }

  createOperatorGlobally(createOperatorDto: CreateOperatorDto) {
    const operator = this.operatorRepository.create(createOperatorDto);
    return this.operatorRepository.save(operator);
  }

  async findAllOperators(user: any) {
    return user.is_admin
      ? this.findAll()
      : this.findAllInClient(user.client_id);
  }

  async findAll() {
    return this.operatorRepository.find({ relations: ['roles', 'client'] });
  }

  async findAllInClient(clientID: number) {
    return this.operatorRepository.find({
      where: {
        client: {
          id: clientID,
        },
      },
      relations: ['roles', 'client'],
    });
  }


  async findOneByUserId(userID: number){
    return this.operatorRepository
      .createQueryBuilder('operator')
      .leftJoinAndSelect('operator.user', 'user')
      .leftJoinAndSelect('operator.client', 'client')
      .leftJoinAndSelect('operator.roles', 'roles')
      .where('user.id = :id', { id: userID })
      .getOneOrFail();
  }
  
  async findOne(id: number) {
    return this.operatorRepository
      .createQueryBuilder('operator')
      .leftJoinAndSelect('operator.user', 'user')
      .leftJoinAndSelect('operator.client', 'client')
      .leftJoinAndSelect('operator.roles', 'roles')
      .where('operator.id = :id', { id })
      .getOneOrFail();
  }

  async findOneInClient(id: number, clientID: number) {
    return this.operatorRepository
      .createQueryBuilder('operator')
      .leftJoinAndSelect('operator.user', 'user')
      .leftJoinAndSelect('operator.client', 'client')
      .leftJoinAndSelect('operator.roles', 'roles')
      .where('operator.id = :id', { id })
      .andWhere('operator.client.id = :clientID', { clientID })
      .getOneOrFail();
  }

  async findOneOperator(id: number, user: any) {
    return (user.is_admin || user.is_authorized)
      ? this.findOne(id)
      : this.findOneInClient(id, user.client_id);
  }

  async assignUser(id: number, user: Partial<User>) {
    const operator = await this.findOne(id);
    if (operator) {
      if (operator.user && operator.user.id !== user.id) {
        throw new Error(
          'Cannot assign user to operator already associated with another user',
        );
      }
      const {
        operator: userOperator,
        email,
        password,
        ...sanitizedUser
      } = user;
      if (userOperator && userOperator.id !== operator.id) {
        throw new Error(
          'Cannot assign operator to user already associated with another operator',
        );
      }
      operator.user = sanitizedUser as User;
      return this.operatorRepository.save(operator);
    } else {
      throw new NotFoundException('Operator not found');
    }
  }

  async assignClient(id: number, client: Partial<Client>) {
    const operator = await this.findOne(id);
    if (operator) {
      if (operator.client) {
        throw new Error(
          'Cannot assign client to operator already associated with another client',
        );
      }
      const { operators: clientOperators, ...sanitizedClient } = client;
      if (clientOperators?.includes(operator)) {
        throw new Error('Operator already associated with client');
      }
      operator.client = sanitizedClient as Client;
      return this.operatorRepository.save(operator);
    } else {
      throw new NotFoundException('Operator not found');
    }
  }

  async update(id: number, updateOperatorDto: UpdateOperatorDto, user: any) {
    const operatorUser = updateOperatorDto.user;
    const role = updateOperatorDto.role;

    try {
      if (user.is_admin) {
        if (operatorUser) {
          try {
            this.userService.update(
              user.id,
              { operator: await this.findOne(id) },
              user,
            );
          } catch (error) {
            console.error(error);
          }
        }
      }
      if (role) {
        await this.addRole(id, role, user);
      }
    } catch (error) {
      Logger.error(error.message);
      return 'An error occured updating operator';
    }
  }

  async addRole(id: number, role: Role, user: any) {
    const operator = await this.findOneOperator(id, user);
    const { operators, client: roleClient, ...sanitizedRole } = role;

    if (operator) {
      if (!operator.roles?.find((role) => role.name === sanitizedRole.name)) {
        if (
          roleClient?.name === operator.client?.name &&
          sanitizedRole.name !== SUPERUSER
        ) {
          operator.roles?.push(sanitizedRole);
          return this.operatorRepository.save(operator);
        } else {
          throw new Error('Role client does not match operator client');
        }
      } else {
        throw new Error('Role already exists whitin this operator');
      }
    } else {
      throw new NotFoundException('Operator not found');
    }
  }

  removeByClientAndId(id: number, clientID: number) {
    return this.operatorRepository.delete({
      id,
      client: {
        id: clientID,
      },
    });
  }

  removeById(id: number) {
    return this.operatorRepository.delete(id);
  }

  removeOperator(id: number, user: any) {
    return user?.is_admin
      ? this.removeById(id)
      : this.removeByClientAndId(id, user.client_id);
  }
}
