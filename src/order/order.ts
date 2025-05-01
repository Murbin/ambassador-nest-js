import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item";

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

    @Column()
    first_name: string;

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

    @Column({ nullable: false })
    complete: boolean;

    //@OneToMany(() => OrderItem,   indica cual es la entidad del otro lado de la relacion
    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    order_items: OrderItem[];

    //Lo que devolvera la relacion, como array de OrderItem en la propiedad nueva virtual order_items
    // [
    //     { id: 1, product_title: 'Manzana', order_id: 1 },
    //     { id: 2, product_title: 'Pera', order_id: 1 },
    //     { id: 3, product_title: 'Uva', order_id: 1 }
    //   ]
}