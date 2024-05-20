import { SetMetadata } from '@nestjs/common';
import { DecoratorMetadata } from 'src/enums/decorator.enum';

export const RequireSuperuser = (...args: string[]) =>
  SetMetadata(DecoratorMetadata.REQUIRE_SUPERUSER_ROLE, args);
