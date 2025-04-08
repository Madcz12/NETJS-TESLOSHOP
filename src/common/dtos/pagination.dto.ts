import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {

    @ApiProperty({
        default: 10, description: 'How many pages do you need?'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) //enableImplicitConversions: true
    // transformar
    limit?: number;

    @ApiProperty({
        default: 0, description: 'How many pages do you want to skip?'
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number) //enableImplicitConversions: true
    offset?: number;

}