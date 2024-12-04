import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserType } from 'src/common/dto/user.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserDal {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
  ) {}

  // Create user in DB
  async createUser(userData: UserType): Promise<User> {
    const newUser = this.user.create(userData);
    return await this.user.save(newUser);
  }

  // Find user by email in DB
  async findUserByEmail(emailId: string): Promise<User | undefined> {
    return await this.user.findOneBy({ emailId });
  }
}
