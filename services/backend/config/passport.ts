import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from './env';
import User from '../src/models/User';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      // Ensure User model and findByPk are working correctly
      const user = await User.findByPk(jwtPayload.id);
      if (user) {
        return done(null, user); // Pass the user object
      }
      return done(null, false); // User not found
    } catch (error) {
      return done(error, false); // Error during database lookup
    }
  })
);

export default passport;