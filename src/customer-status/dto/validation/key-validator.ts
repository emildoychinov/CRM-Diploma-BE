import { ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';
import { CHANGE_STATUS_LENGTHS } from 'src/constants';

export function IsDurationKeyOfStatusLengths(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDurationKeyOfStatusLengths',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return Object.keys(CHANGE_STATUS_LENGTHS).includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid key of CHANGE_STATUS_LENGTHS`;
        },
      },
    });
  };
}