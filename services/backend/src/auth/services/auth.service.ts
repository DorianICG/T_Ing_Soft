import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import config from '../../config/env';

class AuthService {
  async validateUser(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async generateToken(user: User) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.JWT_SECRET,
      { expiresIn: '8h' }
    );
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}

export default new AuthService();