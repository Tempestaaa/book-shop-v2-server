import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/modules/users/schema/user.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';
import { hasPasswordHelper } from '@/helpers/utils';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailerService: MailerService,
  ) {}

  async isEmailExists(email: string) {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findAllUsers(query: string) {
    const { filter, sort } = aqp(query);
    let current = 0;
    let pageSize = 0;

    !filter.current ? (current = 1) : (current = filter.current);
    delete filter.current;
    !filter.pageSize ? (pageSize = 1) : (pageSize = filter.pageSize);
    delete filter.pageSize;

    const totalItems = (await this.userModel.find()).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .select('-password')
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return { results, totalPages };
  }

  async findOneUser(_id: string) {
    const user = await this.userModel.findOne({ _id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { email, username } = user;

    return { email, username };
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async removeUser(_id: string) {
    if (mongoose.isValidObjectId(_id))
      return await this.userModel.deleteOne({ _id });
    else throw new BadRequestException({ message: 'Invalid id format' });
  }

  async handleRegister(registerDto: CreateUserDto) {
    const { email, password, username } = registerDto;

    // Check if email exists
    const isExist = await this.isEmailExists(email);
    if (isExist) {
      throw new BadRequestException(
        `Email already exists. Please use other email.`,
      );
    }

    // Hash password
    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }
    const hashPassword = await hasPasswordHelper(password);

    // Generate activation code
    const codeId = uuid();

    const user = await this.userModel.create({
      email,
      username,
      password: hashPassword,
      isActive: false,
      codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    // Send verify email
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account at SpineChill',
      template: 'register',
      context: {
        name: user?.username ?? user.email,
        activationCode: codeId,
      },
    });

    // Return response
    return { _id: user._id };
  }
}
