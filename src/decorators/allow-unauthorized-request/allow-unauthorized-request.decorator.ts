import { SetMetadata } from '@nestjs/common';
import { DecoratorMetadata } from 'src/enums/decorator.enum';

export const AllowUnauthorizedRequest = () => SetMetadata(DecoratorMetadata.UNAUTHORIZED_REQUEST_DECORATOR, true);
