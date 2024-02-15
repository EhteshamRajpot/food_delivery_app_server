import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({ message: "Name is requiered." })
    @IsString({ message: "Name must need to be a string." })
    name: string;

    @Field()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(8, { message: "Password must be at least 8 characters" })
    password: string;

    @Field()
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email is invalid" })
    email: string;

    @Field()
    @IsNotEmpty({ message: "Phone number is required" })
    phone_number: number;

}

@InputType()
export class ActivationDto {
    @Field()
    @IsNotEmpty({ message: "Activation Token is required." })
    activationToken: string;

    @Field()
    @IsNotEmpty({ message: "Activation Code is required." })
    activationCode: string;
} 

@InputType()
export class LoginDto {

    @Field()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(8, { message: "Password must be at least 8 characters" })
    password: string

    @Field()
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email is invalid" })
    email: string;

}