import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    readonly title: string

    @IsNumber()
    @IsPositive()
    @IsOptional()
    readonly price: number

    @IsString()
    @IsOptional()
    readonly description: string

    @IsString()
    @IsOptional()
    readonly slug?: string

    @IsInt()
    @IsPositive()
    readonly stock: number

    @IsString({ each: true })
    @IsArray()
    readonly sizes: string[]

    @IsIn(['male', 'female', 'children', 'unisex'])
    readonly gender: string

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    readonly tags: string[]

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    readonly images: string[]
}
