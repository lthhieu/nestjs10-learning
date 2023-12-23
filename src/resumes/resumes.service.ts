import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>) { }
  async create(createResumeDto: CreateResumeDto, user: IUser) {
    let createNewResume = await this.resumeModel.create({
      ...createResumeDto, userId: user._id, email: user.email, status: 'PENDING', history: [
        {
          status: 'PENDING', updatedAt: new Date(), updatedBy: {
            _id: user._id, email: user.email
          }
        }
      ], createdBy: {
        _id: user._id, email: user.email
      }
    })
    return {
      _id: createNewResume?._id
    }
  }

  async findAll(page: number, limit: number, queryString: string) {
    let { filter, population, projection } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize

    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)

    const totalItems = (await this.resumeModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    let resumes = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .populate(population)
      .select(projection as any)
      // .populate([
      //   { path: 'companyId', select: { name: 1, logo: 1 } },
      //   { path: 'jobId', select: { name: 1 } }
      // ])
      .exec()
    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result: resumes
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let resume = await this.resumeModel.findById(id)
    //@ts-ignore
    if (resume?.isDeleted) {
      throw new BadRequestException('Resume is deleted')
    }
    if (!resume) {
      throw new BadRequestException('Cannot found resume')
    }
    return resume
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let updatedResume = await this.resumeModel.updateOne({ _id: id }, {
        ...updateResumeDto, updatedBy: {
          _id: user._id, email: user.email
        }, $push: {
          history: {
            status: updateResumeDto.status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id, email: user.email
            }
          }
        }
      })
      return updatedResume
    } catch (e) {
      return 'Not found resume update function'
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let deletedResume = await this.resumeModel.softDelete({ _id: id })
      if (deletedResume) {
        await this.resumeModel.updateOne({ _id: id }, {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        })
        return deletedResume
      }
    } catch (e) {
      return 'Not found job remove function'
    }
  }
  async fetchResumeByUserId(user: IUser) {
    let resumes = await this.resumeModel.find({ userId: user._id }).sort('-createdAt').populate([
      { path: 'companyId', select: { name: 1 } },
      { path: 'jobId', select: { name: 1 } }
    ])
    return resumes
  }

  async findAllDeleted() {
    try {
      let resumes = await this.resumeModel.findDeleted()
      return resumes
    } catch (e) {
      return e
    }
  }

  async restore(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let resume = await this.resumeModel.restore({ _id: id })
      if (resume) {
        await this.resumeModel.updateOne({ _id: id }, { $unset: { deletedBy: 1 } })
        return resume
      }
    } catch (e) {
      return 'Not found resume restore function'
    }
  }
}
