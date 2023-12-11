import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
export type CompanyDocument = HydratedDocument<Company>;

@Schema({
    timestamps: true
})
export class Company {
    @Prop()
    name: string;
    @Prop()
    address: string;
    @Prop()
    description: string;
    @Prop()
    createdBy: string;
    @Prop()
    updatedBy: string;
    @Prop()
    deletedBy: string;
    // inside the class definition
    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    // createdBy: User;
    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    // updatedBy: User;
    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    // deletedBy: User;
}

export const CompanySchema = SchemaFactory.createForClass(Company);