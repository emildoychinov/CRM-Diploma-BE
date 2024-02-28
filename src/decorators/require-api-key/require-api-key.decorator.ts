import { SetMetadata } from '@nestjs/common';
import { REQUIRE_API_KEY } from 'src/constants';

export const RequireApiKey = (...args: string[]) => SetMetadata(REQUIRE_API_KEY, args);
