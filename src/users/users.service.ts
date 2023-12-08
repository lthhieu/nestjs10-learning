import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }
  hashPassword = (plainText: string) => {
    let salt = genSaltSync(10);
    let hash = hashSync(plainText, salt);
    return hash
  }
  async create(createUserDto: CreateUserDto) {
    let hash = this.hashPassword(createUserDto.password)
    let user = await this.userModel.create({ email: createUserDto.email, password: hash })
    return user
    // ========
    // const createdUser = new this.userModel({
    //   email, password
    // });
    // return createdUser.save();
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    try {
      let user = await this.userModel.findById(id)
      return user
    } catch (e) {
      return 'Not found user'
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
