import { SetMetadata } from '@nestjs/common';
import { CHECK_ABILITY } from 'src/constants';
export interface RequiredRule {
  action: string;
  subject: string;
  conditions?: any;
}

export const checkAbilites = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);