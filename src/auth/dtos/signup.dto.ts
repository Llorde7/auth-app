import { IsEmail, IsString, Matches, MinLength, IsPhoneNumber  } from "class-validator";


export class SignupDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])/, {message: 'Password must contain at least one hour'})
    password: string;

    @IsPhoneNumber()
    phone: string;
  }
  