"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_service_1 = require("./user/user.service");
const cammon_1 = require("@shopping-app/cammon");
class AuthService {
    constructor(userServicio, authenticationService) {
        this.userServicio = userServicio;
        this.authenticationService = authenticationService;
    }
    signup(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userServicio.findOneByEmail(createUserDto.email);
            if (existingUser)
                return { message: 'This email is taken' };
            const newUser = yield this.userServicio.create(createUserDto);
            const jwt = this.authenticationService.generateJwt({ email: createUserDto.email, userId: newUser.id }, process.env.JWT_KEY);
            return { jwt };
        });
    }
    signin(signinDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userServicio.findOneByEmail(signinDto.email);
            if (!user)
                return { message: 'Wrong credentials' };
            const samePwd = this.authenticationService.pwdCompare(user.password, signinDto.password);
            if (!samePwd)
                return { message: 'Wrong credentials' };
            const jwt = this.authenticationService.generateJwt({ email: user.email, userId: user.id }, process.env.JWT_KEY);
            return { jwt };
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService(user_service_1.userService, new cammon_1.AuthenticationService());
