import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../order/order';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'boolean', default: true })
  is_ambassador: boolean;

  @OneToMany(() => Order, order => order.user, { createForeignKeyConstraints: false })
  orders: Order[];

  get revenue() {
    return this.orders.filter(o => o.complete).reduce((sum, order) => sum + order.ambassador_revenue, 0)
  }

  get name() {
    return this.first_name + ' ' + this.last_name;
  }
}
