import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { ProductService } from '../product/product.service';

//to access to the docket enviroment to run npm run seed:ambassador
// // you need to  run this command docker-compose exec backend sh
(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const productService = app.get(ProductService);


    for (let i = 0; i < 30; i++) {
        await productService.save({
            title: faker.lorem.words(2),
            description: faker.lorem.words(10),
            image: faker.image.urlLoremFlickr({ category: 'business' }),
            price: faker.commerce.price()
        });
    }

    await app.close();
    process.exit();
})();