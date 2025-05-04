import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item";
import { Exclude, Expose } from "class-transformer";
import { Link } from "../link/link";
import { User } from "../user/user";
import { N } from "@faker-js/faker/dist/airline-BUL6NtOJ";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    transaction_id: string;

    @Column()
    user_id: number;

    @Column()
    code: string;

    @Column()
    ambassador_email: string;

    @Exclude()
    @Column()
    first_name: string;

    @Exclude()
    @Column()
    last_name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    zip: string;

    @Exclude()
    @Column({ nullable: false })
    complete: boolean;

    //@OneToMany(() => OrderItem,   indica cual es la entidad del otro lado de la relacion
    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    order_items: OrderItem[];

    @ManyToOne(() => Link, link => link.orders, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'code', referencedColumnName: 'code' })
    link: Link;

    @ManyToOne(() => User, user => user.orders, { createForeignKeyConstraints: false })
    user: User;

    //Lo que devolvera la relacion, como array de OrderItem en la propiedad nueva virtual order_items
    // [
    //     { id: 1, product_title: 'Manzana', order_id: 1 },
    //     { id: 2, product_title: 'Pera', order_id: 1 },
    //     { id: 3, product_title: 'Uva', order_id: 1 }
    //   ]

    @Expose()
    get name() {
        return this.first_name + ' ' + this.last_name;
    }

    @Expose()
    get total(): Number {
        return this.order_items.reduce((sum, item) => sum + item.admin_revenue, 0)
    }

    get ambassador_revenue(): number {
        return this.order_items.reduce((sum, item) => sum + item.ambassador_revenue, 0)
    }
}