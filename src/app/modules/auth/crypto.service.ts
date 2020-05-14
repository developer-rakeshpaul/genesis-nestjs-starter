import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class CryptoService {
  public async hashPassword(password) {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  public async checkPassword(storedPassword, candidatePassword) {
    return await argon2.verify(storedPassword, candidatePassword);
  }
}
