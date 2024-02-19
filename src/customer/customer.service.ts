import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { NotFoundError } from 'rxjs';
import { Client } from 'src/client/entities/client.entity';
import { AccountStatus } from '../enums/customer-account-status.enum';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private authService: AuthService,
  ) { }

  async register(createCustomerDto: CreateCustomerDto) {

    if(!createCustomerDto.account_status){
      createCustomerDto.account_status = AccountStatus.PENDING_ACTIVATION;
    }

    const customer = this.customerRepository.create(createCustomerDto);
    try{
      await this.findByEmailAndClient(customer.email, customer.client.id);
    }catch(error){
      console.error(error);
      let cust = await this.customerRepository.save(customer);
      console.log(cust);
      return this.authService.constructCostumerToken(customer);
    }
    
    throw new Error('Customer with this email already registered under client')

  }

  async login(loginCustomerDto: LoginCustomerDto){

    try{
      const customer = await this.findByEmailAndClient(loginCustomerDto.email, loginCustomerDto.client.id as number);
      console.log(customer);
      if(loginCustomerDto.password === customer.password){
        return this.authService.constructCostumerToken(customer);
      }else{
        throw new UnauthorizedException('Invalid customer credentials for client');
      }
    }catch(error){
      console.log(error.message);
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

  findAll(clientID: number) {
    return this.customerRepository.find({
      where: { 
        client: {id : clientID}
      }})
  }


  async update(id: number, clientID: number, updateCustomerDto: UpdateCustomerDto) {
    
    try{

      const customer = await this.findByIdAndClient(id, clientID);
      const {client: customerClient, ...sanitizedCustomer} = customer;
      if(updateCustomerDto.email && updateCustomerDto.email !== sanitizedCustomer.email){
        try{
          await this.findByEmailAndClient(updateCustomerDto.email, clientID);
        }catch(error){}
        
        finally{
          throw new Error(`User with email ${updateCustomerDto.email} already exists under client ${clientID}`);
        }
      }

      const updatedCustomer = {
        id: customer.id, 
        client: customerClient as Client, 
        ...updateCustomerDto
      }
      return this.customerRepository.save(updatedCustomer)

    }catch(error){
      throw new NotFoundException(`Could not find user ${updateCustomerDto.email} within client ${clientID}`);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
