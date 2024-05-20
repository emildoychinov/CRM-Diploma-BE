import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { checkAbilites } from 'src/decorators/ability/ability.decorator';
import { UserRequest } from 'src/interfaces/requests/user.request';
import { RequireSuperuser } from 'src/decorators/require-superuser/require-superuser.decorator';
import { SubjectActions } from 'src/enums/subject-actions.enum';
import { AllowUnauthorizedRequest } from 'src/decorators/allow-unauthorized-request/allow-unauthorized-request.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @checkAbilites({ action: SubjectActions.CREATE, subject: 'user' })
  @Post('/create')
  create(@Body() createUserDto: CreateUserDto, @Req() request: UserRequest) {
    return this.userService.create(createUserDto, request.user);
  }

  @checkAbilites({ action: SubjectActions.READ, subject: 'user' })
  @Get('/all')
  findAll(@Req() request: UserRequest) {
    return this.userService.findUsers(request.user);
  }

  @checkAbilites({ action: SubjectActions.READ, subject: 'user' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: UserRequest) {
    return this.userService.findUserById(+id, request.user);
  }

  @checkAbilites({ action: SubjectActions.READ, subject: 'user' })
  @Get()
  findByEmail(@Query('email') email: string, @Req() request: UserRequest) {
    return this.userService.findUserByEmail(email, request.user);
  }

  @RequireSuperuser()
  @Get('/all/:client_id')
  findAllInClient(@Param('client_id') clientID: string) {
    return this.userService.findAllInClient(+clientID);
  }

  @checkAbilites({ action: SubjectActions.UPDATE, subject: 'user' })
  @Patch('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: UserRequest,
  ) {
    return await this.userService.update(+id, updateUserDto, request.user);
  }

  @checkAbilites({ action: SubjectActions.DELETE, subject: 'user' })
  @Delete('/delete/:id')
  remove(@Param('id') id: string, @Req() request: UserRequest) {
    return this.userService.removeUser(+id, request.user);
  }
}
