import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CompaniesService } from 'src/companies/companies.service';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { HR_ROLE } from 'src/databases/sample';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
    private companiesService: CompaniesService,
    private usersService: UsersService) { }
  async findOneByName(name: string) {
    let job = await this.jobModel.findOne({ name })
    return job
  }
  async create(createJobDto: CreateJobDto, user: IUser) {
    let checkName = await this.findOneByName(createJobDto.name)
    if (checkName) {
      throw new BadRequestException('Name is existed')
    }
    let checkCompany = await this.companiesService.findOne(createJobDto.company._id.toString())
    if (!checkCompany) {
      throw new BadRequestException('Company is not existed')
    }
    const isTimeAfter = dayjs(new Date(createJobDto.endDate)).isAfter(dayjs(new Date(createJobDto.startDate)))
    if (!isTimeAfter) {
      throw new BadRequestException('End]Date must be after StartDate')
    }
    let createNewJob = await this.jobModel.create({
      ...createJobDto, createdBy: {
        _id: user._id, email: user.email
      }
    })
    return {
      _id: createNewJob?._id
    }
  }

  async findAll(page: number, limit: number, queryString: string, user: IUser) {
    //=====
    let { filter, population } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize

    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)

    const totalItems = (await this.jobModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    //get user info
    if (user?._id) {
      let userInfo = await this.usersService.findOne(user?._id, user)
      if (userInfo?.role?.name === HR_ROLE) {
        let jobs = await this.jobModel.find({
          'company._id': userInfo.company._id
        })
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
          result: jobs
        }
      }
    }

    let jobs = await this.jobModel.find(filter)
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
      result: jobs
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let job = await this.jobModel.findById(id)
    //@ts-ignore
    if (job?.isDeleted) {
      throw new BadRequestException('Job is deleted')
    }
    if (!job) {
      throw new BadRequestException('Cannot found job')
    }
    return job
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let checkName = await this.findOneByName(updateJobDto.name)
    if (JSON.stringify(checkName?._id) !== JSON.stringify(id)) {
      throw new BadRequestException('Name is used')
    }
    let checkCompany = await this.companiesService.findOne(updateJobDto.company._id.toString())
    if (!checkCompany) {
      throw new BadRequestException('Company is not existed')
    }
    try {
      let updatedJob = await this.jobModel.updateOne({ _id: id }, {
        ...updateJobDto, updatedBy: {
          _id: user._id, email: user.email
        }
      })
      return updatedJob
    } catch (e) {
      return 'Not found job update function'
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let deletedJob = await this.jobModel.softDelete({ _id: id })
      if (deletedJob) {
        await this.jobModel.updateOne({ _id: id }, {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        })
        return deletedJob
      }
    } catch (e) {
      return 'Not found job remove function'
    }
  }

  async findAllDeleted() {
    try {
      let jobs = await this.jobModel.findDeleted()
      return jobs
    } catch (e) {
      return e
    }
  }

  async restore(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let job = await this.jobModel.restore({ _id: id })
      if (job) {
        await this.jobModel.updateOne({ _id: id }, { $unset: { deletedBy: 1 } })
        return job
      }
    } catch (e) {
      return 'Not found company restore function'
    }
  }
}
