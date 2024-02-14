import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/user.dto';
import { PrismaService } from '../../../prisma/Prisma.service';
import { Response } from 'express';
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  getHello(): string {
    return 'Hello from UsersService!';
  }
  // register user service
  async register(registerDto: RegisterDto, response: Response) {
    const { name, email, password } = registerDto;
    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      }
    }); 

    if(isEmailExist){
      throw new BadRequestException("User already exist with this email")
    }
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password
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
