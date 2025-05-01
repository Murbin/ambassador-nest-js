import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";
import { Order } from "./order";

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    product_title: string;

    @Column()
    price: number;

    @Column()
    quantity: number;

    @Column()
    admin_revenue: number;

    @Column()
    ambassador_revenue: number;

    @ManyToOne(() => Order, order => order.order_items) //en la entidad Order, esta relación se representa con la propiedad order_items
    @JoinColumn({ name: 'order_id' }) //Crea una columna real en la base de datos llamada order_id en esta tabla-entidad
    order: Order; //esta linea  la clave para que TypeORM entienda qué orden está relacionada con este OrderItem.
}