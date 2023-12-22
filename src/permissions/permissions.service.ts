import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    let { apiPath, method } = createPermissionDto
    // check apiPath+method is existed in db
    let apiPathExist = await this.permissionModel.find({ apiPath, method })
    if (apiPathExist.length > 0) {
      throw new BadRequestException(`${method} method is existed with this ${apiPath} path`)
    }
    let createNewPermission = await this.permissionModel.create({
      ...createPermissionDto, createdBy: {
        _id: user._id, email: user.email
      }
    })
    return {
      _id: createNewPermission?._id
    }
  }

  async findAll(page: number, limit: number, queryString: string) {
    let { filter, population, projection } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize

    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)

    const totalItems = (await this.permissionModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    let permissions = await this.permissionModel.find(filter)
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
      result: permissions
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let permission = await this.permissionModel.findById(id)
    //@ts-ignore
    if (permission?.isDeleted) {
      throw new BadRequestException('Permission is deleted')
    }
    if (!permission) {
      throw new BadRequestException('Cannot found permission')
    }
    return permission
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let { apiPath, method } = updatePermissionDto
    // check apiPath+method is existed in db
    let apiPathExist = await this.permissionModel.find({ apiPath, method })
    if (apiPathExist.length > 0 && JSON.stringify(apiPathExist[0]?._id) !== JSON.stringify(id)) {
      throw new BadRequestException(`${method} method is existed with this ${apiPath} path`)
    }
    let updatedPermission = await this.permissionModel.updateOne({ _id: id }, {
      ...updatePermissionDto, updatedBy: {
        _id: user._id, email: user.email
      }
    })
    return updatedPermission
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    try {
      let deletedPermission = await this.permissionModel.softDelete({ _id: id })
      if (deletedPermission) {
        await this.permissionModel.updateOne({ _id: id }, {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        })
        return deletedPermission
      }
    } catch (e) {
      return 'Not found permission remove function'
    }
  }
}
