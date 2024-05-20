import { SetMetadata } from '@nestjs/common';
import { DecoratorMetadata } from 'src/enums/decorator.enum';
import { SubjectActions } from 'src/enums/subject-actions.enum';
export interface RequiredRule {
  action: SubjectActions;
  subject: string;
  conditions?: any;
}

export const checkAbilites = (...requirements: RequiredRule[]) =>
  SetMetadata(DecoratorMetadata.CHECK_ABILITY, requirements);
