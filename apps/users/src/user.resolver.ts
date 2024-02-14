import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UsersService } from "./users.service";
import { RegisterResponse } from "./types/user.types";
import { RegisterDto } from "./dto/user.dto";
import { BadRequestException } from "@nestjs/common"
import { User } from "./entities/user.entity";





@Resolver("User")
// @useFilters
export class UsersResolver {
    constructor(
        private readonly userService: UsersService
    ) { }

    @Mutation(() => RegisterResponse)
    async register(
        @Args("registerInput") registerDto: RegisterDto,
    ): Promise<RegisterResponse> {
        if (!registerDto.name || !registerDto.email || !registerDto.password) {
            throw new BadRequestException("Please fill the all fields");
        }
        const user = await this.userService.register(registerDto);

        return { user }
    }

    @Query(() => [User])
    async getUsers() {
        return this.userService.getUsers()
    }
}