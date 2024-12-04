import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('user')
@Unique(['emailId'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email_id', type: 'varchar', length: 255, nullable: false })
  emailId: string;

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255, nullable: false })
  lastName: string;
}