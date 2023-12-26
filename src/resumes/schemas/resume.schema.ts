import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Job } from 'src/jobs/schemas/job.schema';
import { User } from 'src/users/schemas/user.schema';

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({
    timestamps: true
})
export class Resume {
    @Prop()
    email: string;
    @Prop()
    userId: mongoose.Schema.Types.ObjectId;
    @Prop()
    url: string;
    @Prop()
    status: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
    companyId: Company;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name })
    jobId: Job
    @Prop({ type: mongoose.Schema.Types.Array })
    history: {
        status: string,
        updatedAt: Date,
        updatedBy: {
            _id: mongoose.Schema.Types.ObjectId,
            email: string
        }
    }[]
    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };
    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };
    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);