import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ActivationDto, LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/Prisma.service';
import { Response } from 'express';
import * as bcrypt from "bcrypt";
import { EmailService } from './email/email.service';

interface UserData {
  name: string;
  email: string;
  password: string;
  phone_number: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService
  ) { }

  getHello(): string {
    return 'Hello from UsersService!';
  }
  // register user service
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password, phone_number } = registerDto;
    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      }
    });

    if (isEmailExist) {
      throw new BadRequestException("User already exist with this email")
    }

    const isPhoneNumberExist = await this.prisma.user.findUnique({
      where: {
        phone_number
      }
    })

    if (isPhoneNumberExist) {
      throw new BadRequestException("User already exist with this phone number")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = {
      name,
      email,
      password: hashedPassword,
      phone_number,
    };

    const activationToken = await this.createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const activation_token = activationToken.token;

    await this.emailService.sendMail({
      email,
      subject: "Activate your account",
      template: "./activation-mail",
      name,
      activationCode,
    })

    return { activation_token, response }
  }

  // create activation token
  async createActivationToken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = this.JwtService.sign(
      {
        user,
        activationCode
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: "5m"
      }
    )
    return { token, activationCode }
  }

  // activation user
  async activateUser(activationDto: ActivationDto, response: Response) {
    const { activationCode, activationToken } = activationDto;

    const newUser: { user: UserData; activationCode: string } = this.JwtService.verify(
      activationToken,
      { secret: this.configService.get<string>("ACTIVATION_SECRET") } as JwtVerifyOptions
    ) as { user: UserData; activationCode: string };

    if (newUser.activationCode !== activationCode) {
      throw new BadRequestException("Invalid activation code");
    }

    const { name, email, password, phone_number } = newUser.user;

    const existUser = await this.prisma.user.findUnique({
      where: {
        email,
      }
    });

    if (existUser) {
      throw new BadRequestException("User already exist with this email");
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password, 
        phone_number,
        address: "No Address Provided",
      }
    })

    return { user, response }  
  }

  // login user service
  async Login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = {
      email,
      password
    };
    return user
  }

  // get all-user service
  async getUsers() {
    return this.prisma.user.findMany({})
  }
}
