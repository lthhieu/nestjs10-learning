import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  @ResponseMessage('Created new company successfully')
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch list companies with pagination')
  findAll(@Query('current') page: string, @Query('pageSize') limit: string, @Query() queryString: string) {
    return this.companiesService.findAll(+page, +limit, queryString);
  }

  @Public()
  @Get('info')
  @ResponseMessage('Fetch info company successfully')
  findOne(@Query('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update info company successfully')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @User() user: IUser) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Deleted company successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
  @Put(':id')
  @ResponseMessage('Restored company successfully')
  restore(@Param('id') id: string) {
    return this.companiesService.restore(id);
  }

  @Get('find-deleted')
  @ResponseMessage('Fetch deleted companies successfully')
  findAllDeleted() {
    return this.companiesService.findAllDeleted();
  }
}
