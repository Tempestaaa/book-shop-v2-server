import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

interface UserMethods {
  comparePassword: (plainPassword: string) => Promise<boolean>;
}

export type UserDocument = HydratedDocument<User> & UserMethods;

@Schema({ timestamps: true })
export class User {
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  image: string;

  @Prop({ default: 'LOCAL' })
  accountType: string;

  @Prop({ default: 'USER' })
  role: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  codeId: string;

  @Prop()
  codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
