import { Controller, Inject, Post } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
 constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  @Post('register')
  register(){
    return this.client.send({cmd:'auth.register.user'}, {})
  }

  @Post('login')
  login(){
    return this.client.send({cmd:'auth.login.user'}, {})
  }

  @Post('verifyUser')
  verifyUser(){
    return this.client.send({cmd:'auth.verify.user'}, {})
  }
  
}
