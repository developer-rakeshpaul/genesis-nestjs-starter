import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Entity,
  OneToMany,
} from 'typeorm';
import { Todo } from './todo.entity';

@ObjectType()
@Index('user_email_key', ['email'], { unique: true })
@Index('UQ_user_email', ['email'], { unique: true })
@Index('UQ_facebook_id', ['facebookId'], { unique: true })
@Index('user_facebook_id_key', ['facebookId'], { unique: true })
@Index('user_github_id_key', ['githubId'], { unique: true })
@Index('UQ_github_id', ['githubId'], { unique: true })
@Index('UQ_google_id', ['googleId'], { unique: true })
@Index('user_google_id_key', ['googleId'], { unique: true })
@Index('PK_user_id', ['id'], { unique: true })
@Index('UQ_user_phone', ['phone'], { unique: true })
@Index('user_phone_key', ['phone'], { unique: true })
@Index('user_twitter_id_key', ['twitterId'], { unique: true })
@Index('UQ_twitter_id', ['twitterId'], { unique: true })
@Index('UQ_user_username', ['username'], { unique: true })
@Index('user_username_key', ['username'], { unique: true })
@Entity('user', { schema: 'public' })
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Field()
  @Column('text', {
    nullable: false,
    name: 'name',
  })
  name: string;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    unique: true,
    name: 'username',
  })
  username?: string | null;

  @Field()
  @Column('text', {
    nullable: false,
    unique: true,
    name: 'email',
  })
  email: string;

  @Column('text', {
    nullable: false,
    name: 'password',
  })
  password: string;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    unique: true,
    name: 'phone',
  })
  phone?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column('jsonb', {
    name: 'bio',
    nullable: true,
    default: () => 'jsonb_build_object()',
  })
  bio: object | null;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    unique: true,
    name: 'google_id',
  })
  googleId?: string | null;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    unique: true,
    name: 'facebook_id',
  })
  facebookId?: string | null;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    unique: true,
    name: 'twitter_id',
  })
  twitterId?: string | null;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    unique: true,
    name: 'github_id',
  })
  githubId?: string | null;

  @Field(() => String, { nullable: true })
  @Column('text', {
    nullable: true,
    name: 'image_url',
  })
  imageUrl?: string | null;

  @Field()
  @Column('text', {
    nullable: false,
    default: () => 'verification',
    name: 'status',
  })
  status?: string;

  @Column('boolean', {
    nullable: true,
    default: () => false,
    name: 'email_verified',
  })
  emailVerified: boolean | null;

  @Field()
  @Column('text', {
    nullable: true,
    default: () => 'user',
    name: 'role',
  })
  role?: string;

  @Column('integer', {
    nullable: true,
    default: () => 1,
    name: 'token_version',
  })
  tokenVersion?: number;

  @Field(() => String, { nullable: true })
  @Column('timestamp with time zone', {
    nullable: true,
    name: 'last_login_at',
  })
  lastLoginAt?: Date | null;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({
    nullable: true,
    default: () => 'now()',
    name: 'created_at',
  })
  createdAt: Date | null;

  @Field(() => Date, { nullable: true })
  @UpdateDateColumn({
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date | null;

  @OneToMany(() => Todo, (todo) => todo.createdBy, { lazy: true })
  todos: Promise<Todo[]>;
}

export default User;
