import { User } from '@/modules/users/schema/user.schema';
import { PickType } from '@nestjs/mapped-types';

export class CreateAuthDto extends PickType(User, [
  'email',
  'username',
  'password',
] as const) {}
