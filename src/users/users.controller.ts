import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage('Created new user successfully')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user)
  }

  @Get()
  @ResponseMessage('Fetch list users with pagination')
  findAll(@Query('page') page: string, @Query('limit') limit: string, @Query() queryString: string) {
    return this.usersService.findAll(+page, +limit, queryString);
  }

  @Get('info')
  @ResponseMessage('Fetch info user successfully')
  findOne(@Query('id') id: string, @User() user: IUser) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @ResponseMessage('Update info user successfully')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Deleted user successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Put(':id')
  @ResponseMessage('Restored user successfully')
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Get('find-deleted')
  @ResponseMessage('Fetch deleted users successfully')
  findAllDeleted() {
    return this.usersService.findAllDeleted();
  }
}
