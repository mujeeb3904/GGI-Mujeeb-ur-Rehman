import { User } from '../../modules/user/entities/user.entity';

export interface AuthenticatedRequest {
  user: User;
}
