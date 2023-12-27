import { Injectable } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,
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

  update(id: number, updateOperatorDto: UpdateOperatorDto) {
    return `This action updates a #${id} operator`;
  }

  remove(id: number) {
    return `This action removes a #${id} operator`;
  }
}
