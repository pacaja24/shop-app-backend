import { NextFunction } from "express";
import { AuthDto } from "./dtos/auth.dto";
import { UserService, userService } from "./user/user.service";
import { AuthenticationService, BadRequestError } from "@shopping-app/cammon";

export class AuthService {
    constructor(
        public userServicio: UserService,
        public authenticationService: AuthenticationService
    ){}

    async signup(createUserDto: AuthDto){
        const existingUser = await this.userServicio.findOneByEmail(createUserDto.email)
        if(existingUser) return {message: 'This email is taken'}

        const newUser = await this.userServicio.create(createUserDto);

        const jwt = this.authenticationService.generateJwt({email: createUserDto.email, userId: newUser.id}, process.env.JWT_KEY!);
        
        return {jwt};
    }

    async signin(signinDto: AuthDto){
        const user = await this.userServicio.findOneByEmail(signinDto.email);
        if(!user) return {message: 'Wrong credentials'}

        const samePwd = this.authenticationService.pwdCompare(user.password, signinDto.password);

        if(!samePwd) return {message: 'Wrong credentials'}

        const jwt = this.authenticationService.generateJwt({email: user.email, userId: user.id}, process.env.JWT_KEY!);

        return {jwt};
    }

}

export const authService = new  AuthService(userService, new AuthenticationService())