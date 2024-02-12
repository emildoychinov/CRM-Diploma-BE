import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { AbilityGuard } from 'src/ability/ability.guard';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @UseGuards(AbilityGuard)
  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorService.create(createOperatorDto);
  }

  @Get()
  findAll() {
    return this.operatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operatorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperatorDto: UpdateOperatorDto) {
    return this.operatorService.update(+id, updateOperatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operatorService.remove(+id);
  }
}
