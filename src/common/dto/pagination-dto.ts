import { IsOptional, IsPositive, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number) // enable implicit conversions : true (in global pipe)
    readonly limit?: number;

    @IsOptional()
    @Min(0)
    @Type(() => Number) // enable implicit conversions : true (in global pipe)
    readonly offset?: number;

}