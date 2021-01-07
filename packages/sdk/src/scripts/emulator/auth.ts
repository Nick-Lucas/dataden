import express from 'express'
import chalk from 'chalk'
import { PluginAuth, PluginService, Settings } from 'src/core'
import { getAuthCacheFilePath, writeJson } from './files'

type AuthCache = Record<string, string | string[]>

export async function getAuthResult(plugin: PluginService, settings: Settings) {
  console.log('')

  const authCachePath = getAuthCacheFilePath()
  let authCache: AuthCache = null
  try {
    console.log(chalk.grey('Trying to load authcache from: ' + authCachePath))
    authCache = require(authCachePath)
  } catch (e) {
    console.warn(
      chalk.yellow(
        'authCache could not be loaded. Full auth flow will need to be run'
      )
    )
  }

  const auth = plugin.authMethod
  switch (auth.type) {
    case 'none': {
      break
    }
    case 'oauth2_authorizationcode': {
      if (authCache) {
        const refreshResult = await auth.updateAuthState(settings, authCache)
        if (refreshResult === 'reauthorization_required') {
          authCache = await runOAuth2Flow(auth, settings)
        }
      } else {
        authCache = await runOAuth2Flow(auth, settings)
      }

      console.log(
        chalk.grey('Caching auth credentials for later in: ') + authCachePath
      )
      writeJson(authCachePath, authCache)

      console.log('')
      return authCache
    }
    default: {
      throw `Unsupported auth type by emulator: ${(auth as any).type}`
    }
  }
}

async function runOAuth2Flow(
  auth: PluginAuth.OAuth2AuthMethod,
  settings: Settings<Record<string, any>, Record<string, string>>
) {
  const listenPort = 3000
  const listenHost = `http://localhost:${listenPort}`
  const listenPath = '/oauth2'
  const listenUri = listenHost + listenPath

  const uri = await auth.getAuthUri(settings, {
    redirectUri: listenUri,
    state: JSON.stringify({
      pluginId: 'test-plugin',
      instanceName: 'test-instance'
    })
  })

  if (!uri) {
    throw 'No URI returned by plugin. Is it a local configuration issue or a bug?'
  }

  console.info(
    `Follow this auth link to connect the 3rd party provider: ${chalk.green(
      uri
    )}`
  )

  console.log(
    chalk.grey(
      `Listening at path ${chalk.white(
        listenUri
      )} for response from 3rd party oauth2 source`
    )
  )

  type Response = { code: string; scope: string; state: string }
  const authResponse = await new Promise<Response>((resolve) => {
    let server = null

    server = express()
      .get<void, string, void, Response>(listenPath, (request, response) => {
        console.info(chalk.green('Received response from 3rd party'))

        response.send('You may return to the emulator now')

        server.close()

        resolve(request.query)
      })
      .listen(listenPort)
  })

  if (
    !authResponse.code ||
    !authResponse.scope ||
    JSON.parse(authResponse.state)?.pluginId !== 'test-plugin' ||
    JSON.parse(authResponse.state)?.instanceName !== 'test-instance'
  ) {
    console.error(
      'Recieved invalid response from 3rd party. Must contain the keys code,scope,state.pluginId,state.instanceName but recieved:',
      authResponse
    )
    throw 'Invalid Response From 3rd Party'
  }

  console.log('Recieved valid authorisation:', authResponse)

  const tokens = await auth.exchangeAuthorizationForAuthState(settings, {
    ...authResponse,
    redirectUri: listenUri
  })

  return tokens
}
