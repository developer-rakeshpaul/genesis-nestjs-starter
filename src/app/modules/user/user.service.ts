import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import head from 'lodash.head';
import { ConfigService } from 'nestjs-config';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CryptoService } from '../auth/crypto.service';
import { USER_STATUS_ACTIVE } from './../../constants';
import { UserWhereInput } from './dto/user.where.input';
import User from './models/user.entity';

// import { UserCreateInput } from './dto/user.create.input';
// import { UserUpdateInput } from './dto/user.update.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  public async update(user: Partial<User>, where: UserWhereInput) {
    const result = await this.userRepository.update(where, user);
    return result;
  }

  public async find(criteria: FindManyOptions<User>) {
    return await this.userRepository.find(criteria);
  }

  public async findOne(criteria: FindOneOptions<User>) {
    const user = await this.userRepository.findOne(criteria);
    return user;
  }

  public async findById(id: string) {
    const user = head(await this.userRepository.findByIds([id], { take: 1 }));
    return user;
  }

  public async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  public async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }

  public async exists(criteria: FindOneOptions<User>) {
    const user = await this.userRepository.findOne(criteria);
    return user ? true : false;
  }

  public async encrypt(password: string) {
    return await this.cryptoService.hashPassword(password);
  }

  public async create(user: Partial<User>) {
    let password = user.password;
    if (password) {
      password = await this.cryptoService.hashPassword(user.password);
    }

    const newUser = await this.userRepository.create({
      ...user,
      password,
    });
    await newUser.save();
    return newUser;
  }

  /**
   * Seed all resources.
   *
   * @function
   */
  public createAll(users: Array<Partial<User>>): Array<Promise<Partial<User>>> {
    return users.map(async (user: Partial<User>) => {
      try {
        const record = await this.findByEmail(user.email);
        if (record) {
          return Promise.resolve({
            ...record,
            ...user,
            name: record.name,
            status: USER_STATUS_ACTIVE,
            emailVerified: true,
          });
        }
        return Promise.resolve(await this.userRepository.create(user));
      } catch (error) {
        Promise.reject(error);
      }
    });
  }

  public async saveAll(users: Array<Partial<User>>): Promise<Array<User>> {
    try {
      const savedUsers = await this.userRepository.save(users);
      return savedUsers;
    } catch (error) {
      Promise.reject(error);
    }
  }
}
