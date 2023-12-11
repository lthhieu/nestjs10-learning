import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
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
  async create(createUserDto: CreateUserDto) {
    let hash = this.hashPassword(createUserDto.password)
    let user = await this.userModel.create({ email: createUserDto.email, password: hash })
    return user
  }

  async findAll() {
    let users = await this.userModel.find().select('-password')
    return users
  }

  async findOne(id: string) {
    try {
      let user = await this.userModel.findById(id).select('-password')
      return user
    } catch (e) {
      return 'Not found user findOne function'
    }
  }

  async findOneByUsername(email: string) {
    let user = await this.userModel.findOne({ email })
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      let user = await this.userModel.updateOne({ _id: id }, { ...updateUserDto })
      return user
    } catch (e) {
      return 'Not found user update function'
    }
  }

  async remove(id: string) {
    try {
      let user = await this.userModel.softDelete({ _id: id })
      return user
    } catch (e) {
      return 'Not found user remove function'
    }
  }

  async restore(id: string) {
    try {
      let user = await this.userModel.restore({ _id: id })
      return user
    } catch (e) {
      return 'Not found user restore function'
    }
  }

  async findAllDeleted() {
    try {
      let users = await this.userModel.findDeleted()
      return users
    } catch (e) {
      return 'hieu'
    }
  }
}
