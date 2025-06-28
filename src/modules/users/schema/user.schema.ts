import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

enum UserAccountType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  // ****** Essentials fields ******
  @Prop({ required: true, trim: true, maxlength: 50 })
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username: string;

  @Prop({ required: true, trim: true, unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  // ****** Optional fields ******
  @Prop({ trim: true, maxlength: 50 })
  @IsString()
  @IsOptional()
  firstName: string;

  @Prop({ trim: true, maxlength: 50 })
  @IsString()
  @IsOptional()
  lastName: string;

  @Prop()
  @IsOptional()
  image: string;

  @Prop({ trim: true })
  @IsOptional()
  address: string;

  // ****** User account type ******
  @Prop({ enum: UserAccountType, default: UserAccountType.LOCAL })
  @IsEnum(UserAccountType)
  accountType: UserAccountType;

  // ****** User role ******
  @Prop({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  // ****** Is verified? ******
  @Prop({ default: false })
  @IsBoolean()
  isActive: boolean;

  // ****** Verify token and expired date ******
  @Prop()
  @IsOptional()
  codeId: string;

  @Prop()
  @IsOptional()
  codeExpired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
