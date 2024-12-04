import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ShortUrl } from './short_url.entity';

@Entity('short_url_unique_device')
export class ShortUrlUniqueDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ShortUrl, { eager: true })
  @JoinColumn({ name: 'short_url_alias', referencedColumnName: 'alias' }) 
  shortUrl: ShortUrl;

  @Column({
    name: 'device_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  deviceName: string;

  @Column({ name: 'uk_click', type: 'int', default: 0 })
  ukClick: number;

  @Column({ name: 'uk_user', type: 'int', default: 0 })
  ukUser: number;

  @CreateDateColumn({ name: 'created' })
  created: Date;

  @UpdateDateColumn({ name: 'updated' })
  updated: Date;
}
