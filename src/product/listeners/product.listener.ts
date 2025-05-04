
import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Cache } from "cache-manager";

@Injectable()
export class ProductListener {
    constructor(
        @Inject('CACHE_MANAGER') private cacheManager: Cache
    ) { }

    @OnEvent('products_frontend')
    async handleProductFrontend() {
        await this.cacheManager.del('products_frontend')
    }

}