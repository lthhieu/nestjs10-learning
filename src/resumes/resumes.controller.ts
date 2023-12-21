import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage('Created new CV successfully')
  create(@Body() createResumeDto: CreateResumeDto, @User() user: IUser) {
    return this.resumesService.create(createResumeDto, user);
  }

  @Get()
  @ResponseMessage('Fetch list CVs with pagination')
  findAll(@Query('current') page: string, @Query('pageSize') limit: string, @Query() queryString: string) {
    return this.resumesService.findAll(+page, +limit, queryString);
  }

  @Get('info')
  @ResponseMessage('Fetch info CV successfully')
  findOne(@Query('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Updated CV\'s status successfully')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateResumeDto, @User() user: IUser) {
    return this.resumesService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Deleted resume successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }

  @Post('by-user')
  @ResponseMessage('Fetch CVs by userID successfully')
  fetchResumeByUserId(@User() user: IUser) {
    return this.resumesService.fetchResumeByUserId(user);
  }

  @Put(':id')
  @ResponseMessage('Restored resume successfully')
  restore(@Param('id') id: string) {
    return this.resumesService.restore(id);
  }

  @Get('find-deleted')
  @ResponseMessage('Fetch deleted resumes successfully')
  findAllDeleted() {
    return this.resumesService.findAllDeleted();
  }
}
