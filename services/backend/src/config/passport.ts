import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from './env';
import User from '../models/User';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.id);
      if (user) {
        return done(null, user); 
      }
      return done(null, false); 
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;