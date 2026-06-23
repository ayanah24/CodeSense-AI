import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import { encrypt } from '../utils/encryption.js';
// Called explicitly from app.js after dotenv.config() has run
export function initPassport() {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope:['user:email','repo'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user
          const user = await User.findOneAndUpdate(
            { githubId: profile.id },
            {
              githubId:          profile.id,
              username:          profile.username,
              displayName:       profile.displayName || profile.username,
              avatarUrl:         profile.photos?.[0]?.value || '',
              email:             profile.emails?.[0]?.value || '',
              githubAccessToken: encrypt(accessToken),
            },
            { upsert: true, new: true, runValidators: true }
          );

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

export default passport;