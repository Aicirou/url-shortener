import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { UserDal } from 'src/dal/user.dal';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  constructor(private userDal: UserDal) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
      );
      const payload = response.data;
      if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new UnauthorizedException('Invalid audience');
      }
      request.user = payload;
      const userRegistered = await this.userDal.findUserByEmail(
        request.user.email,
      );
      if (!userRegistered) {
        throw new UnauthorizedException('User Not Registered');
      }
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
