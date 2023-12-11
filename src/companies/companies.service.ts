import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>) { }
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    let newCompany = await this.companyModel.create({
      ...createCompanyDto, createdBy: user.email
    })
    return newCompany
  }

  async findAll() {
    let companies = await this.companyModel.find()
    return companies
  }

  async findOne(id: string) {
    try {
      let company = await this.companyModel.findById(id)
      if (!company) {
        return 'Not found company findOne function'
      }
      return company
    } catch (e) {
      return 'Not found company findOne function'
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    try {
      let company = await this.companyModel.updateOne({ _id: id }, { ...updateCompanyDto, updatedBy: user.email })
      return company
    } catch (e) {
      return 'Not found company update function'
    }
  }

  async remove(id: string, user: IUser) {
    try {
      let company = await this.companyModel.softDelete({ _id: id })
      if (company) {
        await this.companyModel.updateOne({ _id: id }, { deletedBy: user.email })
        return company
      }
    } catch (e) {
      return 'Not found company remove function'
    }
  }
  async restore(id: string) {
    try {
      let company = await this.companyModel.restore({ _id: id })
      return company
    } catch (e) {
      return 'Not found company restore function'
    }
  }

  async findAllDeleted() {
    try {
      let companies = await this.companyModel.findDeleted()
      return companies
    } catch (e) {
      return e
    }
  }
}
