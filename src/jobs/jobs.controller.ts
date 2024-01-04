import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, SkipPermission, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @ResponseMessage('Created new job successfully')
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @SkipPermission()
  @Get()
  @ResponseMessage('Fetch list jobs with pagination')
  findAll(@Query('current') page: string, @Query('pageSize') limit: string, @Query() queryString: string, @User() user: IUser) {
    return this.jobsService.findAll(+page, +limit, queryString, user);
  }

  @Public()
  @Get('info')
  @ResponseMessage('Fetch info job successfully')
  findOne(@Query('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Updated job successfully')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Deleted job successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }

  @Put(':id')
  @ResponseMessage('Restored job successfully')
  restore(@Param('id') id: string) {
    return this.jobsService.restore(id);
  }

  @Get('find-deleted')
  @ResponseMessage('Fetch deleted jobs successfully')
  findAllDeleted() {
    return this.jobsService.findAllDeleted();
  }
}
