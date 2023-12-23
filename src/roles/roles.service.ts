import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }
  async findOneByName(name: string) {
    let role = await this.roleModel.findOne({ name })
    return role
  }
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    //check name existed
    let { name, permissions } = createRoleDto
    let checkName = await this.roleModel.findOne({ name })
    if (checkName) {
      throw new BadRequestException(`Role's name '${name}' is existed`)
    }
    //remove duplicate permissions
    let uniquePermissions = [... new Set(permissions)]
    let createNewRole = await this.roleModel.create({
      ...createRoleDto, permissions: uniquePermissions, createdBy: {
        _id: user._id, email: user.email
      }
    })
    return {
      _id: createNewRole?._id
    }
  }

  async findAll(page: number, limit: number, queryString: string) {
    let { filter, population, projection } = aqp(queryString)
    let { sort }: { sort: any } = aqp(queryString)
    delete filter.current
    delete filter.pageSize

    let defaultLimit = +limit ? +limit : 10
    let offset = (+page - 1) * (+defaultLimit)

    const totalItems = (await this.roleModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)

    if (isEmpty(sort)) {
      sort = "-updatedAt"
    }
    let roles = await this.roleModel.find(filter)
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
      result: roles
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let role = (await this.roleModel.findById(id))
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } })
    //@ts-ignore
    if (role?.isDeleted) {
      throw new BadRequestException('Role is deleted')
    }
    if (!role) {
      throw new BadRequestException('Cannot found role')
    }
    return role
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    //check name existed
    let { name, permissions } = updateRoleDto
    let checkName = await this.findOneByName(name)
    if (JSON.stringify(checkName?._id) !== JSON.stringify(id)) {
      throw new BadRequestException('Name is used')
    }
    //remove duplicate permissions
    let uniquePermissions = [... new Set(permissions)]
    let updatedPermission = await this.roleModel.updateOne({ _id: id }, {
      ...updateRoleDto, permissions: uniquePermissions, updatedBy: {
        _id: user._id, email: user.email
      }
    })
    return updatedPermission
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID is invalid')
    }
    let foundRole = await this.roleModel.findById(id)
    if (foundRole.name === "ADMIN")
      throw new BadRequestException('Cannot delete admin role')
    try {
      let deletedRole = await this.roleModel.softDelete({ _id: id })
      if (deletedRole) {
        await this.roleModel.updateOne({ _id: id }, {
          deletedBy: {
            _id: user._id,
            email: user.email
          }
        })
        return deletedRole
      }
    } catch (e) {
      return 'Not found permission remove function'
    }
  }
}
