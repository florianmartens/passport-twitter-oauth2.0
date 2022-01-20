var OAuth2Strategy = require("passport-oauth2");
var util = require("util");
var InternalOAuthError = require("passport-oauth2").InternalOAuthError;
var base64url = require("base64url");

function Strategy(options, verify) {
    // PRIVATE vs. PUBLIC: Private clients send requests with an Authorization header
    // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
    options.customHeaders = {
        ...(options.clientType === "private"
            ? {
                  Authorization:
                      "Basic " +
                      base64url(`${options.clientID}:${options.clientSecret}`),
              }
            : {}),
        ...(options.customHeaders || {}),
    };

    options.clientType = options.clientType || "public";
    options.authorizationURL =
        options.authorizationURL || "https://twitter.com/i/oauth2/authorize";
    options.tokenURL =
        options.tokenURL || "https://api.twitter.com/2/oauth2/token";
    options.scope = options.scope || [
        "tweet.read",
        "offline.access", // required for refresh tokens to be issued
        "users.read",
    ];

    OAuth2Strategy.call(this, options, verify);

    this.options = options;
    this.name = "twitter";
    this.profileUrl = "https://api.twitter.com/2/users/me";
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
    this._oauth2.useAuthorizationHeaderforGET(true);
    this._oauth2.get(
        this.profileUrl,
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
