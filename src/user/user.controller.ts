import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard)
    @Get('admin/ambassadors')
    async ambassadors() {
        return this.userService.find({
            where: { is_ambassador: true }
        })
    }

    @Get('ambassador/rankings')
    async rankings() {
        const ambassadors = await this.userService.find({
            where: { is_ambassador: true }, relations: ['orders', 'orders.order_items']
        })

        return ambassadors.map(ambassador => ({
            name: ambassador.name,
            revenue: ambassador.revenue
        }))
    }
}   