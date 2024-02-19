import { Inject, Injectable, NotFoundException, UseInterceptors, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OperatorService } from 'src/operator/operator.service';
import * as bcrypt from 'bcrypt';
import { AllowUnauthorizedRequest } from 'src/allow-unauthorized-request/allow-unauthorized-request.decorator';

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
    return this.userRepository.save(user);
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
      if(updateUserDto.operator){
        try{
          const userOperator = await this.operatorService.assignUser(operator?.id as number, user);
          user.operator = userOperator;
        }catch(error){
          console.error(error);
          return false;
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
