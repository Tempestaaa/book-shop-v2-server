import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/modules/users/schema/user.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';
import { hasPasswordHelper } from '@/helpers/utils';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailerService: MailerService,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async create(createUserDto: CreateUserDto) {
    const { username, email, firstName, lastName, password } = createUserDto;

    // Check if email exists
    const isExist = await this.isEmailExists(email);
    if (isExist) {
      throw new BadRequestException({
        message: `Email already exists: ${email}. Please use other email.`,
      });
    }

    const hashPassword = await hasPasswordHelper(password);

    const user = await this.userModel.create({
      username,
      email,
      firstName,
      lastName,
      password: hashPassword,
    });

    return { _id: user._id };
  }

  async findAll(query: string) {
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    // Check if id valid
    if (mongoose.isValidObjectId(_id))
      return await this.userModel.deleteOne({ _id });
    else throw new BadRequestException({ message: 'Id is not valid' });
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { email, firstName, lastName, password } = registerDto;

    // Check if email exists
    const isExist = await this.isEmailExists(email);
    if (isExist) {
      throw new BadRequestException({
        message: `Email already exists: ${email}. Please use other email.`,
      });
    }

    // Hash password
    const hashPassword = await hasPasswordHelper(password);

    // Generate activation code
    const codeId = uuid();

    const user = await this.userModel.create({
      email,
      firstName,
      lastName,
      password: hashPassword,
      isActive: false,
      codeId,
      codeExpired: dayjs().add(30, 'seconds'),
    });

    // Send verify email
    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Activate your account at SpineChill',
        template: 'register',
        context: {
          name: user?.username ?? user.email,
          activationCode: codeId,
        },
      })
      .then(() => {
        console.log('>>Mail sent');
      })
      .catch((error) => {
        console.log('Mail error: ', error);
      });

    // Return response
    return { _id: user._id };
  }
}
