import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe | null = null;
    private isMockMode = true;

    constructor(
        @Inject('STRIPE_SECRET_KEY') private readonly secretKey: string,
        private configService: ConfigService
    ) {
        if (this.secretKey && this.secretKey !== 'mock_key') {
            this.isMockMode = false;
            this.stripe = new Stripe(this.secretKey, {
                apiVersion: '2025-04-30.basil',
            });
        }
    }

    async createPaymentIntent(amount: number) {
        if (this.isMockMode) {
            // Simular respuesta de Stripe
            return {
                id: `pi_mock_${Date.now()}`,
                amount: amount * 100,
                currency: 'usd',
                status: 'requires_payment_method',
                client_secret: `pi_mock_secret_${Date.now()}`,
            };
        }
        if (!this.stripe) {
            throw new Error('Stripe instance not initialized');
        }
        return this.stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
        });
    }

    async confirmPaymentIntent(paymentIntentId: string) {
        if (this.isMockMode) {
            // Simular confirmación exitosa
            return {
                id: paymentIntentId,
                status: 'succeeded',
                amount: 1000,
                currency: 'usd',
            };
        }
        if (!this.stripe) {
            throw new Error('Stripe instance not initialized');
        }
        return this.stripe.paymentIntents.confirm(paymentIntentId);
    }

    async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
        if (this.isMockMode) {
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
            return {
                id: `cs_mock_${Date.now()}`,
                url: `${frontendUrl}/success`,
                status: 'open',
            };
        }

        if (!this.stripe) {
            throw new Error('Stripe instance not initialized');
        }

        return this.stripe.checkout.sessions.create(params);
    }
} 