import { Article } from '../article/article.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column()
  username: string;

  @Column()
  hashedPassword: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @ManyToMany(() => User)
  @JoinTable()
  follows: User[];

  @ManyToMany(() => User)
  followed_by: User[];

  static build({
    email,
    username,
    hashedPassword,
  }: {
    email: string;
    username: string;
    hashedPassword: string;
  }) {
    const user = new User();

    user.email = email.toLocaleLowerCase();
    user.username = username.toLocaleLowerCase();
    user.hashedPassword = hashedPassword;

    return user;
  }
}
