import { SetMetadata } from '@nestjs/common';
import { CHECK_ABILITY } from 'src/constants';
import { SubjectActions } from 'src/enums/subject-actions.enum';
export interface RequiredRule {
  action: SubjectActions;
  subject: string;
  conditions?: any;
}

export const checkAbilites = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);