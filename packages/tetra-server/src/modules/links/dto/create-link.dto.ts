import { IsUrl, IsISO8601, IsOptional, IsNotEmpty } from 'class-validator';
import type { StringValue }                         from 'ms';

export class CreateLinkDto {
    @IsNotEmpty()
    @IsUrl({ protocols: ['http', 'https'] }, { message: 'Only HTTP/S URLs are currently allowed' })
    destination: string;

    @IsOptional()
    duration?: StringValue;

    @IsISO8601()
    @IsOptional()
    expiresAt?: string;
}
