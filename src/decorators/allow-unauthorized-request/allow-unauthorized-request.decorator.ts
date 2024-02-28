import { SetMetadata } from '@nestjs/common';
import { UNAUTHORIZED_REQUEST_DECORATOR } from 'src/constants';

export const AllowUnauthorizedRequest = () => SetMetadata(UNAUTHORIZED_REQUEST_DECORATOR, true);
