import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }
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
    let user = await this.userModel.create({ email: createUserDto.email, password: hash, createdAt: new Date().toString() })
    return user
    // ========
    // const createdUser = new this.userModel({
    //   email, password
    // });
    // return createdUser.save();
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
      return 'Not found user'
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
      return 'Not found user'
    }
  }

  async remove(id: string) {
    try {
      let user = await this.userModel.deleteOne({ _id: id })
      return user
    } catch (e) {
      return 'Not found user'
    }
  }
}
