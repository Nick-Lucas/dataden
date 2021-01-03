import * as express from 'express'
import passport from 'passport'
import local from 'passport-local'
import expressSession from 'express-session'
import { StatusCodes } from 'http-status-codes'

import { getClient, Users, User } from 'src/db'

import { getScoped } from 'src/logging'
const log = getScoped('AUTH')

passport.use(
  new local.Strategy({ session: true }, (username, password, done) => {
    async function validate() {
      const client = await getClient()

      const seedResult = await Users.ensureDefaultUserSeeded(client)
      if (seedResult === 'seeded') {
        log.info('Just seeded the default admin user')
      }

      log.info(`Validating user credentials for "${username}"`)
      const invalidOrUser = await Users.validate(client, username, password)

      // TODO: what about rate limiting or lock-out?
      if (invalidOrUser === false) {
        log.info('User credentials invalid')
      } else {
        log.info('User credentials valid')
      }

      done(null, invalidOrUser)
    }

    validate()
  })
)

passport.serializeUser((user: User, done) => {
  log.debug(`Serialising User "${user.username}" for session`)

  done(null, user.username)
})

passport.deserializeUser((username, done) => {
  async function retrieve() {
    const client = await getClient()

    const user = await Users.get(client, username)
    if (!user) {
      done('User not found')
      return
    }

    // TODO: what about login timeout?
    done(null, user)
  }

  retrieve()
})

export function init(app: express.Application) {
  app.use(
    expressSession({
      secret: 'TODO:changeme',
      resave: true,
      saveUninitialized: false
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())
}

interface AuthenticatedEndpointOptions {
  permitWhenPasswordResetIsRequired?: boolean
}

export function authenticatedEndpoint({
  permitWhenPasswordResetIsRequired = false
}: AuthenticatedEndpointOptions = {}) {
  return function <P, ResBody, ReqBody, ReqQuery>(
    request: express.Request<P, ResBody, ReqBody, ReqQuery>,
    response: express.Response<ResBody>,
    next: express.NextFunction
  ) {
    const user = request.user as User | undefined
    if (!user?.username) {
      response.sendStatus(StatusCodes.UNAUTHORIZED)
      return
    }

    if (!permitWhenPasswordResetIsRequired && user.resetRequired) {
      response.status(StatusCodes.FORBIDDEN)
      response.send(('Password Reset Required' as unknown) as ResBody)
      return
    }

    next()
  }
}
