import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    description: string;
    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;
    @IsNotEmpty()
    @IsMongoId({ each: true })
    @IsArray()
    permissions: string;
}
