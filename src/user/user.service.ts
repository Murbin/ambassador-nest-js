import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user';
import { Repository } from 'typeorm';
import { AbstractService } from '../shared/abstract.service';

// Injectable this means can be injectable in controllers
@Injectable()
export class UserService extends AbstractService {
    // Esta linea inyecta y habilita los metodos de Repository ORM para crear o 
    // editar y lo asocia a user table con USer entitties
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
        super(userRepository)
    }
}
