import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'vendor' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
