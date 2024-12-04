import { ConflictException, Injectable } from '@nestjs/common';
import { UserDTO } from 'src/common/dto/user.dto';
import { UserDal } from 'src/dal/user.dal';

@Injectable()
export class AuthService {
  constructor(private readonly userDal: UserDal) {}
  async register(userData: UserDTO) {
    const { emailId, firstName, lastName } = userData;
    const userExists = await this.userDal.findUserByEmail(emailId);

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    this.userDal.createUser({
      emailId,
      firstName,
      lastName,
    });

    return 'User Registered Successfully';
  }
}
