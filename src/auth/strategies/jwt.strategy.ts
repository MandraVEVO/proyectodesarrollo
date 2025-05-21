import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Auth } from "../entities/user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../dto/interfaces/jwt-payload.interfaces";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,

        configService: ConfigService

       
    ){
         const jwtSecret = configService.get('JWT_SECRET');
         if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
         }
         super({
            secretOrKey: jwtSecret, 
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //extraer el token del header
        });
    }

    async validate(payload: JwtPayload): Promise<Auth> { 
//este metodo se va llamar si el JWT no ha expirado y si la fimra de jwt hace match con el payload

        const { id } = payload;
        const user = await this.authRepository.findOneBy({ id});

        if(!user)
            throw new UnauthorizedException('Token not valid');
        if(!user.isActive)
            throw new UnauthorizedException('User is inactive, talk to admin');

        // console.log({user});
        return user;
    }
}