import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { OperatorService } from 'src/operator/operator.service';
import * as bcrypt from 'bcrypt';
import { AllowUnauthorizedRequest } from 'src/decorators/allow-unauthorized-request/allow-unauthorized-request.decorator';
import { Operator } from 'src/operator/entities/operator.entity';
import { CreateOperatorDto } from 'src/operator/dto/create-operator.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => OperatorService))
    private operatorService: OperatorService,
  ) {}

  async create(createUserDto: CreateUserDto, u: any) {
    const { password: rawPassword, ...userDto } = createUserDto;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    try {
      return u.is_admin
        ? this.createWithOperator({ password: hashedPassword, ...userDto })
        : this.createUserAndOperator(
            { password: hashedPassword, ...userDto },
            u.client_id,
          );
    } catch (error) {
      Logger.error(error);
      return error.message;
    }
  }

  async createWithOperator(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  async createUserAndOperator(createUserDto: CreateUserDto, clientID: number) {
    const { operator, ...sanitizedDto } = createUserDto;
    const user = this.userRepository.create(sanitizedDto);
    const savedUser = await this.userRepository.save(user);
    this.operatorService.createOperator(
      { user: savedUser } as CreateOperatorDto,
      { client_id: clientID },
    );
    return savedUser;
  }

  async findByEmail(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .leftJoinAndSelect('user.refresh_token', 'refresh_token')
      .where('user.email = :email', { email })
      .getOneOrFail();
  }

  findByEmailAndClient(email: string, clientID: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .where('user.email = :email', { email })
      .andWhere('operator.client.id = :clientID', { clientID })
      .getOneOrFail();
  }

  async findById(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .leftJoinAndSelect('user.refresh_token', 'refresh_token')
      .where('user.id = :id', { id })
      .getOneOrFail();
  }

  async findByIdAndClient(id: number, clientID: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .where('user.id = :id', { id })
      .andWhere('operator.client.id = :clientID', { clientID })
      .getOneOrFail();
  }

  async findUserById(id: number, user: any) {
    return user?.is_admin
      ? this.findById(id)
      : this.findByIdAndClient(id, user.client_id);
  }

  async findUserByEmail(email: string, user: any) {
    return user?.is_admin
      ? this.findByEmail(email)
      : this.findByEmailAndClient(email, user.client_id);
  }

  async update(id: number, updateUserDto: UpdateUserDto, u: any) {
    const user = await this.findById(id);
    const operator = updateUserDto.operator;
    if (user) {
      if (
        operator &&
        (u.is_admin || (operator.client && u.client_id == operator.client.id))
      ) {
        const userOperator = await this.assignOperator(user, operator);
        user.operator = userOperator;
      }

      return this.userRepository.save(user);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async assignOperator(user: User, operator: Partial<Operator>) {
    try {
      const userOperator = await this.operatorService.assignUser(
        operator?.id as number,
        user,
      );
      return userOperator;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  findAllInClient(clientID: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .andWhere('operator.client.id = :clientID', { clientID })
      .getMany();
  }

  findAll() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.operator', 'operator')
      .getMany();
  }

  async findUsers(user: any) {
    return user?.is_admin
      ? this.findAll()
      : this.findAllInClient(user.client_id);
  }

  removeUser(id: number, user: any) {
    return user?.is_admin
      ? this.removeById(id)
      : this.removeByClientAndId(id, user.client_id);
  }

  async removeByClientAndId(id: number, clientID: number) {
    const user = await this.findByIdAndClient(id, clientID);
    user.operator = undefined;
  }

  removeById(id: number) {
    return this.userRepository.delete(id);
  }
}
