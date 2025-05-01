import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

//to access to the docket enviroment to run npm run seed:ambassador you run this command docker-compose exec backend sh
(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userService = app.get(UserService);

    const password = await bcrypt.hash('123', 12);

    for (let i = 0; i < 30; i++) {
        await userService.save({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password,
            is_ambassador: true
        });
    }

    await app.close();
    process.exit();
})();