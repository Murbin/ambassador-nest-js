import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
    constructor(
        @Inject('CACHE_MANAGER') private cacheManager: Cache
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const { page, s, sort } = request.query;

        const cacheKey = `products_frontend_${page}_${s || ''}_${sort || ''}`;

        const cachedData = await this.cacheManager.get(cacheKey);

        if (cachedData) {
            return of(cachedData);
        }

        return next.handle().pipe(
            tap(async (data) => {
                await this.cacheManager.set(cacheKey, data, 60 * 60 * 1000); // 1 hour
            })
        );
    }
} 