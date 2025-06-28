import { User } from '@/modules/users/schema/user.schema';
import { PickType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PickType(User, [
  'username',
  'firstName',
  'lastName',
  'image',
  'address',
] as const) {
  @IsMongoId({ message: 'Invalid id format' })
  @IsNotEmpty({ message: 'ID cannot be empty' })
  _id: string;
}
