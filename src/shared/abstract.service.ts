import { Repository, ObjectLiteral, DeepPartial, FindOptionsWhere, FindOptionsRelations } from "typeorm";

export abstract class AbstractService {
    protected constructor(
        protected readonly repository: Repository<any>) { }

    async save(options) {
        return this.repository.save(options)
    }

    async find(options: { where?: any, relations?: string[] } = {}) {
        return this.repository.find({
            where: options.where || {},
            relations: options.relations || []
        });
    }

    async findOne(options: { where?: any, relations?: string[] }) {
        return this.repository.findOne({
            where: options.where || {},
            relations: options.relations || []
        });
    }

    async update(id: number, options) {
        return this.repository.update(id, options as any)
    }

    async delete(id: number) {
        return this.repository.delete(id)
    }
}