import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'STRIPE_SECRET_KEY',
            useFactory: (configService: ConfigService) => {
                const key = configService.get('STRIPE_SECRET_KEY');
                return key || 'mock_key';
            },
            inject: [ConfigService],
        },
        StripeService
    ],
    exports: [StripeService],
})
export class StripeModule { } 