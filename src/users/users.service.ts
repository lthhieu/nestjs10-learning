import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import { IUser } from './users.interface';
import mongoose from 'mongoose';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) { }
  hashPassword = (plainText: string) => {
    let salt = genSaltSync(10);
    let hash = hashSync(plainText, salt);
    return hash
  }
  comparePassword = (password: string, hash: string) => {
    return compareSync(password, hash);
  }
  async create(createUserDto: CreateUserDto, user: IUser) {
    let checkEmail = await this.findOneByUsername(createUserDto.email)
    if (checkEmail) {
      throw new BadRequestException('Email is existed')
    }
    let hash = this.hashPassword(createUserDto.password)
    let createNewUser = await this.userModel.create({
      ...createUserDto, password: hash, createdBy: {
        _id: user._id, email: user.email
      }
    })
    return {
      _id: createNewUser?._id
    }
  }

  async findAll(page: number, limit: number, queryString: string) {
    let { filter, population } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize
    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)
    const totalItems = (await this.userModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)
    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    let users = await this.userModel.find(filter).select('-password')
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
      result: users
    }
  }

  async findOne(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    if (id !== user._id) {
      throw new BadRequestException('Cannot watch other info')
    }
    let us = await this.userModel.findById(id).select('-password')
    //@ts-ignore
    if (us?.isDeleted) {
      throw new BadRequestException('User is deleted')
    }
    if (!us) {
      throw new BadRequestException('Cannot found user')
    }
    return us

  }

  async findOneByUsername(email: string) {
    let user = await this.userModel.findOne({ email })
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let checkEmail = await this.findOneByUsername(updateUserDto.email)
    if (JSON.stringify(checkEmail?._id) !== JSON.stringify(id)) {
      throw new BadRequestException('Email is used')
    }
    try {
      let updatedUser = await this.userModel.updateOne({ _id: id }, {
        ...updateUserDto, updatedBy: {
          _id: user._id, email: user.email
        }
      })
      return updatedUser
    } catch (e) {
      return 'Not found user update function'
    }
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    if (id === user._id) {
      throw new BadRequestException('Cannot delete yourself')
    }
    try {
      let deletedUser = await this.userModel.softDelete({ _id: id })
      if (deletedUser) {
        await this.userModel.updateOne({ _id: id }, {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        })
        return deletedUser
      }
    } catch (e) {
      return 'Not found user remove function'
    }
  }

  async restore(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let restoreUser = await this.userModel.restore({ _id: id })
      if (restoreUser) {
        await this.userModel.updateOne({ _id: id }, { $unset: { deletedBy: 1 } })
        return restoreUser
      }
    } catch (e) {
      return 'Not found user restore function'
    }
  }

  async findAllDeleted() {
    try {
      let users = await this.userModel.findDeleted()
      // Convert object to string
      const jsonString = JSON.stringify(users);

      // Convert string back to plain object
      const rawObject = JSON.parse(jsonString);
      if (users) {
        return rawObject.map(item => {
          delete item.password
          return item
        })
      }
      return users
    } catch (e) {
      return e
    }
  }
  async register(registerUserDto: RegisterUserDto) {
    let checkEmail = await this.findOneByUsername(registerUserDto.email)
    if (checkEmail) {
      throw new BadRequestException('Email is existed')
    }
    let hash = this.hashPassword(registerUserDto.password)
    let user = await this.userModel.create({ ...registerUserDto, password: hash, role: 'USER' })
    return {
      _id: user?._id
    }
  }
  updateRefreshToken = async (refreshToken: string, _id: string) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let updatedUser = await this.userModel.updateOne({ _id }, {
        refreshToken
      })
      return updatedUser
    } catch (e) {
      return 'Not found user update function'
    }
  }
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).select('-password')
  }
}
