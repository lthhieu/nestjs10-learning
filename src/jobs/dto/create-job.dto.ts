import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, Max, Min, ValidateNested } from 'class-validator';
import { CompanyDTO } from 'src/users/dto/create-user.dto';
export class CreateJobDto {
    @IsNotEmpty()
    name: string;

    @ArrayNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => CompanyDTO)
    company: CompanyDTO;

    @IsNotEmpty()
    location: string;

    @IsNotEmpty()
    @Min(1)
    salary: number;

    @IsNotEmpty()
    level: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate: Date;

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    endDate: Date

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean

}
