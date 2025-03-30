import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user';
import { Repository } from 'typeorm';

// Injectable this means can be injectable in controllers
@Injectable()
export class UserService {
    // Esta linea inyecta y habilita los metodos de Repository ORM para crear o 
    // editar y lo asocia a user table con USer entitties
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {

    }

    async save(options) {
        return this.userRepository.save(options)
    }

    async findOne(options) {
        return this.userRepository.findOne({ where: options });
    }
}
