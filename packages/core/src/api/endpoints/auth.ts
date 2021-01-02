import { Express } from 'express'
import * as passport from 'passport'

import { authenticatedEndpoint } from './common'
import { Logger } from 'src/logging'
import * as Db from 'src/db'

import { MaybeError } from './common'
import { PostLogin, GetProfile, PostLogout } from './auth.types'

export function listen(app: Express, log: Logger) {
  app.post<void, MaybeError<PostLogin.Response>, PostLogin.Body, void>(
    PostLogin.path,
    passport.authenticate('local', {}),
    (request, response) => {
      const user = request.user as Db.User

      response.send({
        username: user.username,
        resetRequired: user.resetRequired
      })
    }
  )

  app.get<void, MaybeError<GetProfile.Response>, void, void>(
    GetProfile.path,
    authenticatedEndpoint,
    (request, response) => {
      const user = request.user as Db.User

      response.send({
        username: user.username,
        resetRequired: user.resetRequired
      })
    }
  )

  app.post<void, void, void, void>(
    PostLogout.path,
    authenticatedEndpoint,
    (request, response) => {
      log.info(
        `User ${(request.user as any)?.username ?? 'NOT SIGNED IN'} signing out`
      )
      request.logout()
      response.sendStatus(200)
    }
  )
}
