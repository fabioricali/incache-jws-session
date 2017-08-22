
<div align="center">

# JWS Session handler

[![Build Status](https://travis-ci.org/davidep87/incache-jws-session.svg?branch=master)](https://travis-ci.org/davidep87/incache-jws-session)
[![Coverage Status](https://coveralls.io/repos/github/davidep87/incache-jws-session/badge.svg?branch=master&1)](https://coveralls.io/github/davidep87/incache-jws-session?branch=master)
<a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" title="License: MIT"/></a>
<img src="https://img.shields.io/badge/node.js%20-%3E%207.6-blue.svg" title="Node.js version"/>
<img src="https://img.shields.io/badge/team-terrons-orange.svg" title="Team Terrons"/>
</div>

##### Generate token with HS256 (HMAC with SHA-256) symmetric algorithm
##### Store token in cache to double check if token is generated by our machine


### How to use:
```javascript
npm install incache-jws-session --save
```

```javascript

const Session = require('incache-jws-session')

const config = {
  secret: '@2e£$1#1&$23_-!', // secret key (String)
  serverHost: 'www.mdslab.org', // server hostname (String)
  time: 1 // Set time expiration in minutes (Int)
}

const auth = new Session(config)
```

##### Generate a new token passing the user ID and the user type

```javascript
const token = await auth.createToken(1, 'user')
```

##### Store the new session token in redis

```javascript

const session = {
  user: 1,
  token,
  exp: new Date().getTime() + 1,
  type: 'user'
}

await auth.insert(session)

const result = await auth.check(token)
```

##### Decode an existing token and check if is valid and generated by our machine:

```javascript
const decoded = await auth.decodeToken(token)
```

### Using the session handler as middleware in Koa
#### Attach the session handler over the Koa context

```javascript
app.context.auth = auth
```

#### Create a Middleware

```javascript
module.exports = function(){

  return async function(ctx, next){

    if(!ctx.request.body.token)
      return ctx.body = { isLogged : false, token: false , message: 'You must provide a token for this route' }

    let status = await ctx.auth.check(ctx.request.body.token)

    if(!status.isLogged)
      return ctx.body = { isLogged : false, token: false , message: 'You are not logged in please do the log-in again' }

    await next()
  }

}
```

#### Now you can use it in your route file

```javascript
const router = require('koa-router')()
const body = require('koa-body')()
const auth = require('./authMiddleware')

router.post('/admin', body, auth(), yourProtectedFunction)
```

## Author
<a target="_blank" href="https://www.mdslab.org">Davide Polano</a>