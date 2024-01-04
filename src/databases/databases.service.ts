import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, HR_ROLE, INIT_COMPANIES, INIT_JOBS, INIT_PERMISSIONS, USER_ROLE } from './sample';
import { Company, CompanyDocument } from 'src/companies/schemas/company.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import mongoose from 'mongoose';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);
    constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
        @InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>,
        @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
        @InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>,
        @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
        private usersService: UsersService,
        private configService: ConfigService) { }
    async onModuleInit() {
        const isInit = this.configService.get<string>("SHOULD_INIT")
        if (Boolean(isInit)) {
            const countUser = await this.userModel.countDocuments({})
            const countPermission = await this.permissionModel.countDocuments({})
            const countRole = await this.roleModel.countDocuments({})
            const countCompany = await this.companyModel.countDocuments({})
            const countJob = await this.jobModel.countDocuments({})
            //create permissions
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
                //bulk create
            }

            // create role
            if (countRole === 0) {
                const permissions = await this.permissionModel.find({}).select("_id");
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: "Admin Full Roles",
                        isActive: true,
                        permissions: permissions
                    },
                    {
                        name: USER_ROLE,
                        description: "User using system",
                        isActive: true,
                        permissions: [] //không set quyền, chỉ cần add ROLE
                    }, {
                        name: HR_ROLE,
                        description: "Hr using system",
                        isActive: true,
                        permissions: [
                            new mongoose.Types.ObjectId('648ad499dafdb9754f40b84b'),
                            new mongoose.Types.ObjectId('648ad4a6dafdb9754f40b850'),
                            new mongoose.Types.ObjectId('648ad4ccdafdb9754f40b859'),
                            new mongoose.Types.ObjectId('648ad4d9dafdb9754f40b85e'),
                            new mongoose.Types.ObjectId('648ad4fedafdb9754f40b863'),
                            new mongoose.Types.ObjectId('648ad511dafdb9754f40b868'),
                            new mongoose.Types.ObjectId('648ad522dafdb9754f40b86d'),
                            new mongoose.Types.ObjectId('648ad53bdafdb9754f40b872'),
                            new mongoose.Types.ObjectId('648ad555dafdb9754f40b877'),
                            new mongoose.Types.ObjectId('648ad56ddafdb9754f40b87c'),
                            new mongoose.Types.ObjectId('648ad488dafdb9754f40b846')
                        ]
                    }
                ]);
            }

            if (countCompany === 0) {
                await this.companyModel.insertMany(INIT_COMPANIES);
            }

            if (countJob === 0) {
                await this.jobModel.insertMany(INIT_JOBS);
            }

            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE });
                const hrRole = await this.roleModel.findOne({ name: HR_ROLE })
                await this.userModel.insertMany([
                    {
                        name: "I'm admin",
                        email: "admin@gmail.com",
                        password: this.usersService.hashPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 69,
                        gender: "MALE",
                        address: "VietNam",
                        role: adminRole?._id
                    },
                    {
                        name: "I'm normal user",
                        email: "user@gmail.com",
                        password: this.usersService.hashPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 69,
                        gender: "MALE",
                        address: "VietNam",
                        role: userRole?._id
                    },
                    {
                        name: "I'm hr user",
                        email: "hr@gmail.com",
                        password: this.usersService.hashPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 69,
                        gender: "MALE",
                        address: "VietNam",
                        role: hrRole?._id,
                        company: {
                            _id: "64871834c7573fac797f8402",
                            name: "Netflix Inc",
                            logo: "netflix-1686706116042.png"
                        }
                    },
                ])
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0 && countCompany > 0 && countJob > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }

        }
    }
}
