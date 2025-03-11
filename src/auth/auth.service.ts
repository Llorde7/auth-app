import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private UserModel: Model <User>) {}
    async signup(signupData: SignupDto){
        //Check if email is in use 
        const emailInUse = await this.UserModel.findOne({ email: signupData.email })
        if (emailInUse) {
            throw new BadRequestException("Email in use.")
        }
    }
}
