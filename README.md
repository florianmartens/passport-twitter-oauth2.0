# Passport-Twitter2.0

Twitter API v2 is ready for prime time! Twitter recommends that the majority of developers start to think about migrating to v2 of the API.

[Passport](http://passportjs.org/) strategy for authenticating with [Twitter](https://twitter.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Twitter OAuth 2.0 in your Node.js applications.
By plugging into Passport, Twitter authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

```shell
$ npm install passport-twitter-oauth2.0
```

## Usage

```javascript
passport.use(
    new TwitterStrategy(
        {
            clientID: TWITTER_CLIENT_ID,
            clientSecret: TWITTER_CLIENT_SECRET,
            callbackURL: YOUR_CALLBACK_URL,
            clientType: "public", // chose "public" or "private"
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
