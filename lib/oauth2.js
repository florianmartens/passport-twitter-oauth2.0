var OAuth2Strategy = require("passport-oauth2");
var util = require("util");
var InternalOAuthError = require("passport-oauth2").InternalOAuthError;
var base64url = require("base64url");

function Strategy(options, verify) {
    // Private clients send requests using "Authorization" header as per docs:
    // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
    options.customHeaders = {
        ...(options.clientType === "private"
            ? {
                  Authorization:
                      "Basic " +
                      Buffer.from(`${options.clientID}:${options.clientSecret}`).toString('base64'),
              }
            : {}),
        ...(options.customHeaders || {}),
    };

    options.clientType = options.clientType || "public";
    options.authorizationURL =
        options.authorizationURL || "https://twitter.com/i/oauth2/authorize";
    options.tokenURL =
        options.tokenURL || "https://api.twitter.com/2/oauth2/token";
    options.pkce = options.pkce || true;
    options.state = options.state || true;
    options.scope = options.scope || [
        "tweet.read",
        "offline.access", // required for refresh tokens to be issued
        "users.read",
    ];
    options.skipExtendedProfile = options.skipExtendedProfile || false;
    if (!options.skipExtendedProfile && options.scope.indexOf("users.read") === -1) {
        options.skipExtendedProfile = true;
    }

    OAuth2Strategy.call(this, options, verify);

    this.options = options;
    this.name = "twitter";
    this.profileUrl = "https://api.twitter.com/2/users/me";
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
    this._oauth2.useAuthorizationHeaderforGET(true);
    let url = this.profileUrl;
    if (!this.options.skipExtendedProfile) {
        url = url + "?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld"
    }
    this._oauth2.get(
        url,
        accessToken,
        function (err, body) {
            if (err) {
                return done(
                    new InternalOAuthError("failed to fetch user profile", err)
                );
            }

            let profile;

            try {
                profile = parseProfile(body);
            } catch (e) {
                return done(
                    new InternalOAuthError(
                        "failed to parse profile response",
                        e
                    )
                );
            }
            return done(null, profile);
        }.bind(this)
    );
};

function parseProfile(body) {
    const parsedBody = JSON.parse(body).data;

    const profile = {
        provider: "twitter",
        _response: parsedBody,
        _raw: body,
        ...parsedBody,
    };

    return profile;
}

module.exports = Strategy;
