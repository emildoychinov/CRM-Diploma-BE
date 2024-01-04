import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Client } from 'src/client/entities/client.entity';

@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) { }

  create(createOperatorDto: CreateOperatorDto) {
    const operator = this.operatorRepository.create(createOperatorDto);
    return this.operatorRepository.save(operator);
  }

  findAll() {
    return `This action returns all operator`;
  }

  async findOne(id: number) {
    return this.operatorRepository
      .createQueryBuilder('operator')
      .leftJoinAndSelect('operator.user', 'user')
      .leftJoinAndSelect('operator.client', 'client')
      .leftJoinAndSelect('operator.roles', 'roles')
      .where('operator.id = :id', { id })
      .getOne();
  }

  async assignUser(id:number, user: Partial<User>){
    const operator = await this.findOne(id);
    if(operator){
      if(operator.user){
        throw new Error('Cannot assign user to operator already associated with another user');
      }
      const {operator: userOperator, email, password, ...sanitizedUser} = user;
      if(userOperator){
        throw new Error('Cannot assign operator to user already associated with another operator');
      }
      operator.user = sanitizedUser as User;
      return this.operatorRepository.save(operator)
    }else{
      throw new NotFoundException('Operator not found');
    }
  }

  async assignClient(id: number, client: Partial<Client>){
    const operator = await this.findOne(id);
    if(operator){
      if(operator.client){
        throw new Error('Cannot assign client to operator already associated with another client');
      }
      const {operators: clientOperators, ...sanitizedClient} = client;
      if(clientOperators?.includes(operator)){
        throw new Error('Operator already associated with client');
      }
      operator.client = sanitizedClient as Client;
      return this.operatorRepository.save(operator)
    }else{
      throw new NotFoundException('Operator not found');
    }
  }

  
  async update(id: number, updateOperatorDto: UpdateOperatorDto) {
    const operator = await this.findOne(id);
    const client = updateOperatorDto.client;
    const user = updateOperatorDto.user;
    const roles = updateOperatorDto.roles;
    if(operator){
      if(user){
        try{
          this.userService.update(user.id, {operator: operator})
        }catch(error){
          console.error(error);
        }
      }

    }else{
      throw new NotFoundException('Operator not found');
    }

  }

  remove(id: number) {
    return `This action removes a #${id} operator`;
  }
}
