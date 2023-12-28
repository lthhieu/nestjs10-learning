import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>) { }
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    //check email unique
    let checkEmail = await this.subscriberModel.findOne({ email: createSubscriberDto.email })
    if (checkEmail) {
      throw new BadRequestException('Email is existed')
    }
    let createNewSubscriber = await this.subscriberModel.create({
      ...createSubscriberDto, createdBy: {
        _id: user._id, email: user.email
      }
    })
    return {
      _id: createNewSubscriber?._id
    }
  }

  async findAll(page: number, limit: number, queryString: string) {
    let { filter, population, projection } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize

    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)

    const totalItems = (await this.subscriberModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    let subscribers = await this.subscriberModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort)
      .populate(population)
      .select(projection as any)
      .exec()
    return {
      meta: {
        current: page, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result: subscribers
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let subscriber = await this.subscriberModel.findById(id)
    //@ts-ignore
    if (subscriber?.isDeleted) {
      throw new BadRequestException('Subscriber is deleted')
    }
    if (!subscriber) {
      throw new BadRequestException('Cannot found subscriber')
    }
    return subscriber
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    //check email
    let checkEmail = await this.subscriberModel.findOne({ email: updateSubscriberDto.email })
    if (JSON.stringify(checkEmail?._id) !== JSON.stringify(id)) {
      throw new BadRequestException('Email is used')
    }
    try {
      let updatedSubscriber = await this.subscriberModel.updateOne({ _id: id }, {
        ...updateSubscriberDto, updatedBy: {
          _id: user._id, email: user.email
        }
      })
      return updatedSubscriber
    } catch (e) {
      return 'Not found subscriber update function'
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let deletedSubs = await this.subscriberModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })

    if (deletedSubs.matchedCount === 0) {
      throw new BadRequestException("Cannot delete because not found subs")
    }
    return await this.subscriberModel.softDelete({ _id: id })
  }
}
