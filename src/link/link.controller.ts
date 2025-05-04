import { Controller, Param, Get, UseGuards, Post, Body, Req } from '@nestjs/common';
import { LinkService } from './link.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
@Controller()
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
}
