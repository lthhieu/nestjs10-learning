import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
export class CompanyDTO {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}
export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @Min(6)
    @Max(150)
    age: number;

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    @IsMongoId()
    role: mongoose.Schema.Types.ObjectId;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CompanyDTO)
    company: CompanyDTO;
}
export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(150)
    age: number;
    @IsNotEmpty()
    gender: string;
    @IsNotEmpty()
    address: string;
}
