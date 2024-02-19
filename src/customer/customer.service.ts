import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private authService: AuthService,
    private readonly queueService: QueueService,
  ) { }

  async register(createCustomerDto: CreateCustomerDto) {

    if(!createCustomerDto.account_status){
      createCustomerDto.account_status = AccountStatus.PENDING_ACTIVATION;
    }

    const {password: rawPassword, ...customerDto} = createCustomerDto;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const customer = this.customerRepository.create({password: hashedPassword, ...customerDto});

    try{
      await this.findByEmailAndClient(customer.email, customer.client.id);
    }catch(error){
      await this.customerRepository.save(customer);
      return this.authService.constructCostumerToken(customer);
    }
    throw new Error('Customer with this email already registered under client')

  }

  async login(loginCustomerDto: LoginCustomerDto){

    try{
      const customer = await this.findByEmailAndClient(loginCustomerDto.email, loginCustomerDto.client.id as number);
      if(await bcrypt.compare(loginCustomerDto.password, customer.password)){
        return this.authService.constructCostumerToken(customer);
      }else{
        throw new UnauthorizedException('Invalid customer credentials for client');
      }
    }catch(error){
      throw new NotFoundException(`Could not find user ${loginCustomerDto.email} within client ${loginCustomerDto.client.id}`);
    }
  }

  async findByEmailAndClient(email: string, clientID: number){
    return await this.customerRepository.findOneOrFail({
      where: { 
          email: email, 
          client : { id: clientID }
      },
      relations: ['client']
    });
  }

  async findByIdAndClient(id: number, clientID: number){
    return await this.customerRepository.findOneOrFail({
      where: {
        id, 
        client: {id : clientID}
      },
      relations: ['client']
    })
  }

  findAllInClient(clientID: number) {
    return this.customerRepository.find({
      where: { 
        client: {id : clientID}
      }})
  }

  findAll() {
    return this.customerRepository.find({
      relations:['client']
    });
  }


  async update(id: number, clientID: number, updateCustomerDto: UpdateCustomerDto) {
    
    try{

      const customer = await this.findByIdAndClient(id, clientID);
      const {id: customerID, client: customerClient, email: customerEmail, ...sanitizedCustomer} = customer;
      if(updateCustomerDto.email && updateCustomerDto.email !== customerEmail){
        try{
          await this.findByEmailAndClient(updateCustomerDto.email, clientID);
        }catch(error){console.error(error)} 
        finally{
          throw new Error(`User with email ${updateCustomerDto.email} already exists under client ${clientID}`);
        }
      }else{
        updateCustomerDto.email = customerEmail;
      }

      const updatedCustomer = {
        id: customerID,
        client: customerClient,
        ...updateCustomerDto
      }

      return this.customerRepository.save(updatedCustomer)

    }catch(error){
      throw new NotFoundException(`Could not find user ${updateCustomerDto.email} within client ${clientID}`);
    }

  }

  async ban(id: number, clientID: number, statusDto: StatusDto) {
    try{
      const customer = await this.update(id, clientID, {
        account_status: AccountStatus.BANNED,
        notes : statusDto.reason,
      } as UpdateCustomerDto);
      
      const queue = this.queueService.getQueue(`customer.${id}.${clientID}`);

      await this.queueService.add(
        queue,
         `customer.${id}.${clientID}.sendBanMessageProcess`,
         {
          mailDto: {
            receiver: customer.email,
            title: 'Your account has been banned',
            client: customer.client.name,
            reason: customer.notes,
            status: AccountStatus.BANNED,
            duration: DURATION_WORD_KEYS[statusDto.duration]
          } as MailDto
         }
      )

      await this.queueService.add(
       queue,
        `customer.${id}.${clientID}.changeAccountStatusProcess`,
        {
          customer,
          account_status: AccountStatus.PENDING_ACTIVATION,
          notes: `Previously banned for ${statusDto.reason}`
        },
        {delay: CHANGE_STATUS_LENGTHS[statusDto.duration]}
      )

      
      return `Customer ${customer.id} banned successfully`
    }catch(error){
      throw error;
    }
  }



  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
