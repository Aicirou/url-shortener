import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ShortUrlUniqueOS } from './short_url_os.entity';
import { ShortUrlUniqueDevice } from './short_url_device.entity';
import { ShortUrlLogs } from './short_url_logs.entity';

@Entity('short_url')
@Unique(['alias'])
export class ShortUrl {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'short_url', type: 'varchar', length: 255, nullable: false })
  shortUrl: string;

  @Column({ name: 'long_url', type: 'text', nullable: false })
  longUrl: string;

  @Column({ name: 'total_clicks', type: 'int', default: 0 })
  totalClicks: number;

  @Column({ name: 'unique_clicks', type: 'int', default: 0 })
  uniqueClicks: number;

  @Column({ name: 'click_by_date', type: 'jsonb', default: '[]' })
  clickByDate: Record<string, any>[];

  @Column({ name: 'email_id', type: 'varchar', length: 255, nullable: false })
  emailId: string;

  @Column({
    name:'alias',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  alias: string;

  @Column({ name: 'topic', type: 'varchar', length: 255, nullable: true })
  topic: string;

  @CreateDateColumn({ name: 'created' })
  created: Date;

  @UpdateDateColumn({ name: 'updated' })
  updated: Date;

  @OneToMany(() => ShortUrlLogs, (shortUrlLogs) => shortUrlLogs.shortUrl)
  shortUrlLogs: ShortUrlLogs[];

  @OneToMany(() => ShortUrlUniqueOS, (uniqueOs) => uniqueOs.shortUrl)
  uniqueOS: ShortUrlUniqueOS[];

  @OneToMany(
    () => ShortUrlUniqueDevice,
    (uniqueDevice) => uniqueDevice.shortUrl,
  )
  uniqueDevices: ShortUrlUniqueDevice[];
}
