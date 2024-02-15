import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UsersService } from "./users.service";
import { ActivationResponse, RegisterResponse } from "./types/user.types";
import { ActivationDto, RegisterDto } from "./dto/user.dto";
import { BadRequestException } from "@nestjs/common"
import { User } from "./entities/user.entity";
import { Response } from "express";




@Resolver("User")
// @useFilters
export class UsersResolver {
    constructor(
        private readonly userService: UsersService
    ) { }

    @Mutation(() => RegisterResponse)
    async register(
        @Args("registerDto") registerDto: RegisterDto,
        @Context() context: { res: Response }
    ): Promise<RegisterResponse> {
        if (!registerDto.name || !registerDto.email || !registerDto.password || !registerDto.phone_number) {
            throw new BadRequestException("Please fill the all fields");
        }
        const { activation_token } = await this.userService.register(
            registerDto,
            context.res
        )

        return { activation_token }
    }

    @Mutation(() => ActivationResponse)
    async activateUser(
        @Args("activationDto") activationDto: ActivationDto,
        @Context() context: { res: Response },
    ): Promise<ActivationResponse> {
        return await this.userService.activateUser(activationDto, context.res)
    }

    @Mutation(() => User)
    async Login(
        @Args("email") email: string,
        @Args("password") password: string,
    ) {
        return this.userService.Login({ email, password })
    }

    @Query(() => [User])
    async getUsers() {
        return this.userService.getUsers()
    }
}