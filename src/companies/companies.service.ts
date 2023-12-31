import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';
@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>) { }
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    let newCompany = await this.companyModel.create({
      ...createCompanyDto, createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return newCompany
  }

  async findAll(page: number, limit: number, queryString: string) {
    let { filter, population } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize

    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)

    const totalItems = (await this.companyModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    let companies = await this.companyModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .populate(population)
      .exec()
    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result: companies
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let company = await this.companyModel.findById(id)
    //@ts-ignore
    if (company?.isDeleted) {
      throw new BadRequestException('Company is deleted')
    }
    if (!company) {
      throw new BadRequestException('Cannot found company')
    }
    return company
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let company = await this.companyModel.updateOne({ _id: id }, {
        ...updateCompanyDto, updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
      return company
    } catch (e) {
      return 'Not found company update function'
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let company = await this.companyModel.softDelete({ _id: id })
      if (company) {
        await this.companyModel.updateOne({ _id: id }, {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        })
        return company
      }
    } catch (e) {
      return 'Not found company remove function'
    }
  }
  async restore(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let company = await this.companyModel.restore({ _id: id })
      if (company) {
        await this.companyModel.updateOne({ _id: id }, { $unset: { deletedBy: 1 } })
        return company
      }
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
