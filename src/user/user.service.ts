import { Inject, Injectable, NotFoundException, UseInterceptors, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OperatorService } from 'src/operator/operator.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => OperatorService))
    private operatorService: OperatorService,
  ) { }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
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
