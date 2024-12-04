import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShortUrl } from './short_url.entity';

@Entity('short_url_logs')
export class ShortUrlLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ShortUrl, { eager: true })
  @JoinColumn({ name: 'short_url_alias', referencedColumnName: 'alias' }) 
  shortUrl: ShortUrl;

  @Column({ name: 'ip', type: 'varchar', length: 255, nullable: false })
  ip: string;

  @Column({ name: 'os_name', type: 'varchar', length: 255, nullable: false })
  osName: string;

  @Column({
    name: 'device_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  deviceName: string;

  @CreateDateColumn({ name: 'created' })
  created: Date;

  @UpdateDateColumn({ name: 'updated' })
  updated: Date;
}



