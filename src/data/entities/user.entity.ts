import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserEntityPayload = Partial<UserEntity>;

@Entity({
  name: 'user',
  orderBy: { createdAt: 'ASC', uuid: 'ASC' },
})
export class UserEntity {
  constructor(payload: UserEntityPayload) {
    Object.assign(this, payload);
  }

  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'discord_id', nullable: true })
  discordId: string;

  @Column({ name: 'microsoft_id', unique: true })
  microsoftId: string;

  @Column({ name: 'microsoft_login', unique: true })
  microsoftLogin: string;

  @Column({ name: 'vocal_time', default: 0 })
  vocalTime: number;
}
