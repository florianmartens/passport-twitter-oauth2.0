# Passport-Twitter2.0 with PKCE

Twitter recommends that the majority of developers start to think about migrating to v2 of the API.

This package is a [Passport](http://passportjs.org/) strategy for authenticating with [Twitter](https://twitter.com/)
using the OAuth 2.0 API.

By plugging into Passport, Twitter authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

```shell
$ npm install passport-twitter-oauth2.0
```

## Usage

Please note that Twitter requires clients to use PKCE (RFC 7636) when authenticating with OAuth 2.0. When using PKCE with Passport, clients are required to enable `sessions`. Furthermore, the options object passed to the strategy has to specify `pkce=true` and `state=true`.

```javascript
passport.use(
    new TwitterStrategy(
        {
            clientID: TWITTER_CLIENT_ID,
            clientSecret: TWITTER_CLIENT_SECRET,
            callbackURL: YOUR_CALLBACK_URL,
            clientType: "public", // "public" or "private"
            pkce: true, // required,
            state: true, // required
        },
        function (accessToken, refreshToken, profile, done) {
            User.findOrCreate({ githubId: profile.id }, function (err, user) {
                return done(err, user);
            });
        }
    )
);
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'github'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get(
    "/auth/twitter",
    passport.authenticate("twitter", { scope: ["offline.access"] })
);

app.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
    }
);
```

## Credits

-   [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)
