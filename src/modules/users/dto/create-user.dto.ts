import { User } from '@/modules/users/schema/user.schema';
import { PickType } from '@nestjs/mapped-types';

export class CreateUserDto extends PickType(User, [
  'username',
  'email',
  'password',
] as const) {}
