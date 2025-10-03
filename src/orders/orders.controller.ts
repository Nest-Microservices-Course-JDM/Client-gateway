import { Controller, Get, Post, Body, Patch, Param, Inject, ParseUUIDPipe, Query } from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, OrderPaginationDto, StatusDto, } from './dto';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';
import { response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send({cmd: 'createOrder'}, createOrderDto)
  }

  @Get()
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.client.send({cmd: 'findAllOrders'}, orderPaginationDto)
    .pipe(
      catchError((err) => {
        throw new RpcException(err);
        })
      )
  }

  @Get('findByID/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send({cmd: 'findOneOrder'},{id})
    .pipe(
      catchError(err => {throw new RpcException(err)})
    )
  }
  
  //FIND BY STATUS
  @Get(':status')
  findAllByStatus(@Param() statusDto: StatusDto, @Query() paginationDto: PaginationDto) {
    return this.client.send({cmd: 'findAllOrders'},{...paginationDto, status: statusDto.status})
    .pipe(
      catchError(err => {throw new RpcException(err)})
    )
  }

  @Patch(':id')
  changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() statusDto: StatusDto){
    return this.client.send({cmd: 'changeOrderStatus'}, {id, status: statusDto.status})
    .pipe(
      catchError(err => {throw new RpcException(err)})
    )
    
  }
}
