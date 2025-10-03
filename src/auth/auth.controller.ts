import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { User } from './decorators';
import type { CurrenUser } from './interfaces/current-user.interface';
import { Token } from './decorators/token.decorator';

@Controller('auth')
export class AuthController {
 constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}


  //Si en el servicio hacemos un RPC exception, dentro de el controlador
  //del gateway debemos hacer el catch de ese Rpc para que muestre el error

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto){
    return this.client.send({cmd:'auth.register.user'}, registerUserDto)
    .pipe(
      catchError(error => {
        throw new RpcException(error)
      })
    )
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto){
    return this.client.send({cmd:'auth.login.user'}, loginUserDto)
    .pipe(
      catchError(error => {
        throw new RpcException(error)
      })
    )
    
  }


  /*
  Se hace la verificación del token por medio del guard
  y cuando se llegue al verifyUser ya se tenga el token
  En caso de que no llegue el token por medio del guard 
  va a lanzar una UnauthoriezedException diciendo que el token
  no fue encontrado.
  */
  @UseGuards(AuthGuard)
  @Get('verifyUser')
  /*
  Posteriormente nest ejecuta @User()
  Para no tomar directamente @Req() req, se usa un decorador personalizado
  Por otro lado se puede poner el tipo de dato al user que llega del decorador, por eso creamos una interface
  
  El decorador devuelve el objeto user que el guard asignó a la request
  */
  verifyUser(@User() user: CurrenUser, @Token() token: string){
    // const user = req['user']
    
    return {user, token}
  }
  

  /*
  1. HTTP Request
   ↓
   GET /auth/verifyUser
   Authorization: Bearer abc123...

2. AuthGuard.canActivate()
   ↓
   - Extrae token del header
   - Valida token
   - Pone user en request['user']
   - Retorna true

3. @User() Decorator & @Token() Decorator
   ↓
   - Lee request.user que puso el Guard al igual que con el token
   - Los pasa como parámetro al método

4. verifyUser(user)
   ↓
   - Recibe el objeto y token
   - Retorna {user, token}

5. Response
   ↓
   {
     "user": {
       "id": "1",
       "name": "Jhon",
       "email": "thebayharbourbutcher@gmail.com"
     },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZGYzYmMxNjAxMmUwYWJmMmQzYTJjOSIsImVtYWlsIjoiZGF2aWRAZ21haWwuY29tIiwibmFtZSI6Ikp1YW4iLCJpYXQiOjE3NTk0NjEzNDIsImV4cCI6MTc1OTQ2ODU0Mn0.68cpAoCjc7mYhqWLO_-ycwJO5Q_e3VDooEnL8oJtNXI"
  }
  */
}
