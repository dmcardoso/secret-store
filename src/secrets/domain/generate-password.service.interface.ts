import { GeneratePasswordResponseDto } from '../dto/generate-password-response.dto';
import { GeneratePasswordDto } from '../dto/generate-password.dto';

export const GENERATE_PASSWORD_SERVICE = Symbol('GENERATE_PASSWORD_SERVICE');

export interface IGeneratePasswordService {
  execute(dto: GeneratePasswordDto): GeneratePasswordResponseDto;
}
