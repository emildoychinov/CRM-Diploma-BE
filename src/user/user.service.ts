import { Inject, Injectable, NotFoundException, UseInterceptors, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OperatorService } from 'src/operator/operator.service';
import * as bcrypt from 'bcrypt';
import { AllowUnauthorizedRequest } from 'src/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { Operator } from 'src/operator/entities/operator.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => OperatorService))
    private operatorService: OperatorService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const {password: rawPassword, ...userDto} = createUserDto;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const user = this.userRepository.create({password: hashedPassword, ...userDto});
    const savedUser =  await this.userRepository.save(user);
    if(createUserDto.operator){
      this.operatorService.assignUser(createUserDto.operator.id as number, savedUser);
    }
    return savedUser;
  }

  findByEmail(email: string){
    return this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.operator', 'operator')
    .where('user.email = :email', { email })
    .getOne();
  }

  async findById(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .where('user.id = :id', { id })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    const operator = updateUserDto.operator;
    if(user){
      if(operator){
        const userOperator = await this.assignOperator(user, operator);
        user.operator = userOperator;
      }
      if(updateUserDto.refreshToken || updateUserDto.refreshToken == null)
        user.refresh_token = updateUserDto.refreshToken as string;
      
      return this.userRepository.save(user);
      
    }else{
      throw new NotFoundException('User not found');
    }
  }

  async assignOperator(user:User, operator:Partial<Operator>){
    try{
      const userOperator = await this.operatorService.assignUser(operator?.id as number, user);
      return userOperator;
    }catch(error){
      throw new Error(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
