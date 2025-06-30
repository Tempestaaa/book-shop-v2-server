import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { comparePassword } from '@/helpers/utils';
import { UserDocument } from '@/modules/users/schema/user.schema';
import { UsersService } from '@/modules/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid credentials');

    const isPasswordValid = await comparePassword(pass, user.password);
    if (!isPasswordValid)
      throw new BadRequestException('Passwords do not match');

    return user;
  }

  async login(user: UserDocument) {
    const payload = { email: user.email, sub: user._id };
    return {
      _id: user._id,
      email: user.email,
      role: user.role as string,
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return this.usersService.handleRegister(registerDto);
  }

  async getProfile(_id: string) {
    return this.usersService.findOneUser(_id);
  }
}
