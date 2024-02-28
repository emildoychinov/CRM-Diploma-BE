import { SetMetadata } from '@nestjs/common';
import { DecoratorMetadata } from 'src/enums/decorator.enum';

export const RequireApiKey = (...args: string[]) => SetMetadata(DecoratorMetadata.REQUIRE_API_KEY, args);
