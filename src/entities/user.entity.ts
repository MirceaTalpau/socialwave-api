import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;
  @Column()
  @Unique(['email'])
  email: string;
  @Column()
  password: string;
  @Column()
  birthdate: Date;
  @Column()
  name: string;
  @Column()
  bio: string;
  @Column()
  profilePicture: string;
  @Column()
  coverPicture: string;
  @Column()
  isActivated: boolean = false;
  @Column()
  isAdmin: boolean = false;
  @Column()
  verificationToken: string;
}
