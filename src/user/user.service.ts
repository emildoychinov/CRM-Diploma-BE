import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { TransformInterceptor } from 'src/transform/transform.interceptor';
import { validate } from 'class-validator';
import { OperatorService } from 'src/operator/operator.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
    private operatorService: OperatorService
  ) { }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator') // Load the operator relation
      .where('user.id = :id', { id })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if(user){
      if(updateUserDto.operator){
        const userOperator = await this.operatorService.findOne(updateUserDto.operator.id as number);
        if(userOperator && !userOperator.user){
          const {operator, email, password, ...sanitizedUser} = user;
          user.operator = userOperator;
          userOperator.user = sanitizedUser as User;
          console.log(sanitizedUser);
          await this.operatorRepository.save(userOperator);
        }else{
          throw new Error('Cannot assign user to operator already associated with another user')
        }
      }
      return this.userRepository.save(user);
    }else{
      throw new NotFoundException('User not found');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
