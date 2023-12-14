import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsNotEmptyObject, IsObject, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
class CompanyDTO {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
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
    role: string;

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
