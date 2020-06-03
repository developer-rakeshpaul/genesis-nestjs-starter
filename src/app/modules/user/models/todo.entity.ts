import { ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import User from './user.entity';

@Index('todo_pkey', ['id'], { unique: true })
@Entity('todo', { schema: 'public' })
@ObjectType()
export class Todo {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('text', { name: 'desc' })
  desc: string;

  @Column('boolean', { name: 'is_complete', default: () => 'false' })
  isComplete: boolean;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'now()',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.todos, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    lazy: true,
  })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  createdBy: User;
}
