import { StrategyOptionsWithRequest } from 'passport-oauth2';

export type TwitterBaseProfile = {
  id: string;
  username: string;
  _raw: string;
};

export type TwitterFullProfile = TwitterBaseProfile & {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  created_at: string;
  location: string;
  pinned_tweet_id: string;
  name: string;
  protected: boolean;
  profile_image_url: string;
  description: string;
};

export interface TwitterStrategyOptions extends StrategyOptionsWithRequest {
  clientType: 'private' | 'public';
  skipExtendedProfile: boolean;
}

export function parseProfile(body: string | Buffer | undefined) {
  const parsedBody = (() => {
    if (!body) return;
    const result = Buffer.isBuffer(body) ? body.toString() : body;
    return JSON.parse(result).data;
  })();

  const profile = {
    provider: 'twitter',
    _response: parsedBody,
    _raw: body,
    ...parsedBody,
  };

  return profile;
}
