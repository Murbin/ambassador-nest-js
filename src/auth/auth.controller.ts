import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Put, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  @Post('admin/register')
  async register(@Body() body: RegisterDto) {

    const { password_confirm, ...data } = body

    if (body.password !== body.password_confirm) {
      throw new BadRequestException('Passwords do not match!')
    }

    const hashed = await bcrypt.hash(body.password, 12)


    return this.userService.save({
      ...data,
      password: hashed,
      is_ambassador: false
    })
  }

  @Post('admin/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.userService.findOne({ where: { email } })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      throw new BadRequestException('Invalid credential')
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id
    })

    response.cookie('jwt', jwt, { httpOnly: true })

    return {
      msg: 'succes'
    }
  }

  @UseGuards(AuthGuard)
  @Get('admin/user')
  async user(@Req() request: Request) {
    const cookie = request.cookies['jwt']

    const data = await this.jwtService.verifyAsync(cookie)

    if (!data) {
      throw new UnauthorizedException()
    }

    const user = await this.userService.findOne({ where: { id: data.id } })

    return user
  }

  @UseGuards(AuthGuard)
  @Get('admin/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt')

    return {
      msg: 'success'
    }
  }


  @UseGuards(AuthGuard)
  @Put('admin/users/info')
  async updateInfo(
    @Req() request: Request,
    @Body('first_name') first_name: string,
    @Body('last_name') last_name: string,
    @Body('email') email: string
  ) {
    const cookie = request.cookies['jwt']
    const { id } = await this.jwtService.verifyAsync(cookie)

    await this.userService.update(id, {
      first_name,
      last_name,
      email
    })

    return this.userService.findOne({ where: { id } })
  }

  @UseGuards(AuthGuard)
  @Put('admin/users/password')
  async updatePassword(@Req() request: Request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!')
    }

    const cookie = request.cookies['jwt']
    const { id } = await this.jwtService.verifyAsync(cookie)

    await this.userService.update(id, {
      password: await bcrypt.hash(password, 12)
    })

    return this.userService.findOne({ where: { id } })
  }
}
