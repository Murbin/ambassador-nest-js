import { BadRequestException, Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs'
@Controller()
export class AuthController {

  constructor(private userService: UserService) { }

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
    @Body('password') password: string
  ) {
    const user = await this.userService.findOne({ email })
    console.log('ser', user?.password, password)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      throw new BadRequestException('Invalid credential')
    }

    return user
  }
}
