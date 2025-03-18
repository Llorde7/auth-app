import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh.token.schema';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private UserModel: Model <User>,
        @InjectModel(RefreshToken.name) private RefreshTokenModel: Model <RefreshToken>,
    private jwtService: JwtService
) {}
    
    async signup(signupData: SignupDto){
        
        const { email, password, name, phone } = signupData;

        //Check if email is in use 
        const emailInUse = await this.UserModel.findOne({ email: signupData.email })
        if (emailInUse) {
            throw new BadRequestException("Email in use.")
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create user document and save in mongodb
        const newUSer = await this.UserModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
        });

        await newUSer.save();
        return { message: 'User registered successfully'}
        
    }

    async login(credentials: LoginDto){
        const { email , password } = credentials;
        //Find if user exists by email
        const user = await this.UserModel.findOne({ email })
        if(!user){
            throw new UnauthorizedException('Wrong credentials')
        }

        //Compare entered password with existing password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch){
            throw new UnauthorizedException('Wrong credentials')
        }

        //Generate JWT tokens
        return this.generateUserTokens(user._id)
    }

    async refreshTokens(refreshToken: string) {
        const token = await this.RefreshTokenModel.findOne({
          token: refreshToken,
          expiryDate: { $gte: new Date() },
        });

        if (!token) {
            throw new UnauthorizedException();
        }
          
        return this.generateUserTokens(token.userId);
          
    }
    
      
    async generateUserTokens(userId){
        const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h'})
        const refreshToken = uuidv4()
        await this.storeRefreshToken(refreshToken,userId)
        return {
            accessToken,
            refreshToken
        }
    }

    async storeRefreshToken(token: string, userId) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3);

        await this.RefreshTokenModel.updateOne(
            { userId},
            { $set: {expiryDate, token }},
            {upsert:true},
        );

    }
}
