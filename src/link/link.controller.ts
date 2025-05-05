import { Controller, Param, Get, UseGuards, Post, Body, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { LinkService } from './link.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class LinkController {
    constructor(
        private linkService: LinkService,
        private authService: AuthService
    ) { }

    @UseGuards(AuthGuard)
    @Get('admin/users/:id/links')
    async all(@Param('id') id: number) {
        return this.linkService.find({ where: { user: { id } }, relations: ['orders'] })
    }

    @UseGuards(AuthGuard)
    @Post('ambassador/links')
    async create(
        @Body('products') products: number[],
        @Req() req: Request & { cookies: { jwt: string } }
    ) {
        const user = await this.authService.user(req)
        return this.linkService.save({
            code: Math.random().toString(36).substring(2, 15),
            user,
            products: products.map(id => ({ id }))
        })
    }

    @UseGuards(AuthGuard)
    @Get('ambassador/stats')
    async stats(@Req() req: Request & { cookies: { jwt: string } }) {
        const user = await this.authService.user(req)
        const links = await this.linkService.find({ where: { user }, relations: ['orders'] })
        return links.map(link => ({
            code: link.code,
            count: link.orders.length,
            revenue: link.orders.reduce((s, o) => s + o.ambassador_revenue, 0)
        }))
    }

    @Get('checkout/links/:code')
    async checkout(@Param('code') code: string) {
        return this.linkService.findOne({ where: { code }, relations: ['user', 'products'] })
    }

}
