import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        try {
            const jwt = request.cookies['jwt']
            if (!jwt) {
                return false
            }
            const { scope } = await this.jwtService.verifyAsync(jwt)

            const isAmbassador = request.path.toString().includes('api/ambassador')

            return isAmbassador && scope === 'ambassador' || !isAmbassador && scope === 'admin'

        } catch (error) {
            return false
        }
    }
}