import { AuthService } from '@/auth/auth.service';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { LocalAuthGuard } from '@/auth/passport/local-auth.guard';
import { Public } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailerService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService
      .sendMail({
        to: 'tantrungnguyen2001@gmail.com',
        subject: 'Testing Nest MailerModule ✔',
        text: 'welcome',
        template: 'register',
        context: {
          name: 'Ninn',
          activationCode: '123456',
        },
      })
      .then(() => {
        console.log('>>Mail sent');
      })
      .catch((error) => {
        console.log('Mail error: ', error);
      });

    return 'ok';
  }
}
