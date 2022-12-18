import OAuth2Strategy, { InternalOAuthError, VerifyFunctionWithRequest } from 'passport-oauth2';
import { TwitterStrategyOptions, TwitterBaseProfile, TwitterFullProfile, parseProfile } from './utils';

function createOptions(options: TwitterStrategyOptions) {
  options.customHeaders = {
    ...(options.clientType === 'private'
      ? {
          Authorization: 'Basic ' + Buffer.from(`${options.clientID}:${options.clientSecret}`).toString('base64'),
        }
      : {}),
    ...(options.customHeaders || {}),
  };
  options.clientType = options.clientType || 'public';
  options.authorizationURL = options.authorizationURL || 'https://twitter.com/i/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://api.twitter.com/2/oauth2/token';
  options.pkce = options.pkce || true;
  options.state = options.state || true;
  options.scope = options.scope || [
    'tweet.read',
    'offline.access', // required for refresh tokens to be issued
    'users.read',
  ];
  options.skipExtendedProfile = options.skipExtendedProfile || false;
  if (!options.skipExtendedProfile && options.scope.indexOf('users.read') === -1) {
    options.skipExtendedProfile = true;
  }
  return options;
}

class TwitterStrategy extends OAuth2Strategy {
  profileUrl: string;
  skipExtendedProfile: boolean;

  constructor(options: TwitterStrategyOptions, private readonly verify: VerifyFunctionWithRequest) {
    super(createOptions(options), verify);

    this.skipExtendedProfile = options.skipExtendedProfile;
    this.name = 'twitter';
    this.profileUrl = 'https://api.twitter.com/2/users/me';
  }

  userProfile<Profile extends TwitterBaseProfile | TwitterFullProfile = TwitterFullProfile>(
    accessToken: string,
    done: (err?: Error | null | undefined, profile?: Profile) => void,
  ): void {
    this._oauth2.useAuthorizationHeaderforGET(true);
    let url = this.profileUrl;
    if (!this.skipExtendedProfile) {
      url =
        url +
        '?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld';
    }
    this._oauth2.get(
      url,
      accessToken,
      ((err: { statusCode: number; data?: any }, body: string | Buffer | undefined) => {
        if (err) {
          return done(new InternalOAuthError('failed to fetch user profile', err));
        }

        let profile;

        try {
          profile = parseProfile(body);
        } catch (e) {
          return done(new InternalOAuthError('failed to parse profile response', e));
        }
        return done(null, profile);
      }).bind(this),
    );
  }
}

export { TwitterStrategy };
