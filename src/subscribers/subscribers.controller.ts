import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ResponseMessage, SkipPermission, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  @Post('skills')
  @SkipPermission()
  @ResponseMessage("Get subscriber's skills")
  getUserSkills(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Post()
  @ResponseMessage('Created new subscriber successfully')
  create(@Body() createResumeDto: CreateSubscriberDto, @User() user: IUser) {
    return this.subscribersService.create(createResumeDto, user);
  }

  @Get()
  @ResponseMessage('Fetch list subscribers with pagination')
  findAll(@Query('current') page: string, @Query('pageSize') limit: string, @Query() queryString: string) {
    return this.subscribersService.findAll(+page, +limit, queryString);
  }

  @Get('info')
  @ResponseMessage('Fetch info subscriber successfully')
  findOne(@Query('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch()
  @SkipPermission()
  @ResponseMessage('Updated subscriber\'s status successfully')
  update(@Body() updateJobDto: UpdateSubscriberDto, @User() user: IUser) {
    return this.subscribersService.update(updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Deleted subscriber successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
