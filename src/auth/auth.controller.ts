import { Body, Controller, Post, Get, Res, Req,  UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refreshtoken.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // Handle the user data returned from Google
    const user = req.user;
    // You can store the user in the database or generate a JWT token here
    res.redirect('/');
  }

  //POST SignUp
  @Post('signup')
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  //POST Login
  @Post('login')
  async login (@Body() credentials: LoginDto ) {
    return this.authService.login(credentials)
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<any> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

}
