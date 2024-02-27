import { SetMetadata } from '@nestjs/common';
import { REQUIRE_SUPERUSER_ROLE } from 'src/constants';

export const RequireSuperuser = (...args: string[]) => SetMetadata(REQUIRE_SUPERUSER_ROLE, args);
