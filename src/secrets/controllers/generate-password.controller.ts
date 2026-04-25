import { Controller, Patch, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GENERATE_PASSWORD_SERVICE } from '../domain/generate-password.service.interface';
import type { IGeneratePasswordService } from '../domain/generate-password.service.interface';
import { GeneratePasswordDto } from '../dto/generate-password.dto';
import { GeneratePasswordResponseDto } from '../dto/generate-password-response.dto';

@ApiTags('Secrets')
@Controller('secrets')
export class GeneratePasswordController {
  constructor(
    @Inject(GENERATE_PASSWORD_SERVICE)
    private readonly generatePasswordService: IGeneratePasswordService,
  ) {}

  @Patch('generate-password')
  @ApiOperation({ summary: 'Generate a random password' })
  generate(@Body() dto: GeneratePasswordDto): GeneratePasswordResponseDto {
    return this.generatePasswordService.execute(dto);
  }
}
