/**
 * User & passkey registration effects
 */
import {
  type CredentialCreationOptionsJSON,
  parseCreationOptionsFromJSON,
} from '@github/webauthn-json/browser-ponyfill'
import { Context, Effect as E, Layer, flow, pipe } from 'effect'

import type { Duplicate, NotSupported } from '@passlock/shared/dist/error/error.js'
import { InternalBrowserError } from '@passlock/shared/dist/error/error.js'
import type { OptionsErrors, VerificationErrors } from '@passlock/shared/dist/rpc/registration.js'
import { OptionsReq, VerificationReq } from '@passlock/shared/dist/rpc/registration.js'
import type { RegistrationCredential } from '@passlock/shared/dist/schema/passkey.js'
import type { Principal } from '@passlock/shared/dist/schema/principal.js'

import { Capabilities } from '../capabilities/capabilities.js'
import { RegistrationClient } from '../rpc/registration.js'
import { StorageService } from '../storage/storage.js'
import type { UserService } from '../user/user.js'

/* Requests */

export type RegistrationRequest = OptionsReq

/* Dependencies */

export class CreateCredential extends Context.Tag('@services/CreateCredential')<
  CreateCredential,
  {
    createCredential: (
      request: CredentialCreationOptions,
    ) => E.Effect<RegistrationCredential, InternalBrowserError | Duplicate>
  }
>() {}

/* Errors */

export type RegistrationErrors = NotSupported | OptionsErrors | VerificationErrors

/* Service */

export class RegistrationService extends Context.Tag('@services/RegistrationService')<
  RegistrationService,
  {
    registerPasskey: (request: RegistrationRequest) => E.Effect<Principal, RegistrationErrors>
  }
>() {}

/* Utilities */

const fetchOptions = (request: OptionsReq) => {
  return E.gen(function* (_) {
    yield* _(E.logDebug('Making request'))

    const rpcClient = yield* _(RegistrationClient)
    const { publicKey, session } = yield* _(rpcClient.getRegistrationOptions(request))

    yield* _(E.logDebug('Converting Passlock options to CredentialCreationOptions'))
    const options = yield* _(toCreationOptions({ publicKey }))

    return { options, session }
  })
}

const toCreationOptions = (jsonOptions: CredentialCreationOptionsJSON) => {
  return pipe(
    E.try(() => parseCreationOptionsFromJSON(jsonOptions)),
    E.mapError(
      error =>
        new InternalBrowserError({
          message: 'Browser was unable to create credential creation options',
          detail: String(error.error),
        }),
    ),
  )
}

const verifyCredential = (request: VerificationReq) => {
  return E.gen(function* (_) {
    yield* _(E.logDebug('Making request'))

    const rpcClient = yield* _(RegistrationClient)
    const { principal } = yield* _(rpcClient.verifyRegistrationCredential(request))

    return principal
  })
}

/* Effects */

type Dependencies =
  | Capabilities
  | CreateCredential
  | StorageService
  | UserService
  | RegistrationClient

export const registerPasskey = (
  request: RegistrationRequest,
): E.Effect<Principal, RegistrationErrors, Dependencies> => {
  const effect = E.gen(function* (_) {
    yield* _(E.logInfo('Checking if browser supports Passkeys'))
    const capabilities = yield* _(Capabilities)
    yield* _(capabilities.passkeySupport)

    yield* _(E.logInfo('Fetching registration options from Passlock'))
    const { options, session } = yield* fetchOptions(new OptionsReq(request))

    yield* _(E.logInfo('Building new credential'))
    const { createCredential } = yield* _(CreateCredential)
    const credential = yield* _(createCredential(options))

    yield* _(E.logInfo('Storing credential public key in Passlock'))
    const verificationRequest = new VerificationReq({
      ...request,
      credential,
      session,
    })

    const principal = yield* _(verifyCredential(verificationRequest))

    const storageService = yield* _(StorageService)
    yield* _(storageService.storeToken(principal))
    yield* _(E.logDebug('Storing token in local storage'))

    yield* _(E.logDebug('Defering local token deletion'))
    const delayedClearTokenE = pipe(
      storageService.clearExpiredToken('passkey'),
      E.delay('6 minutes'),
      E.fork,
    )
    yield* _(delayedClearTokenE)

    return principal
  })

  return E.catchTag(effect, 'InternalBrowserError', e => E.die(e))
}

/* Live */

/* v8 ignore start */
export const RegistrationServiceLive = Layer.effect(
  RegistrationService,
  E.gen(function* (_) {
    const context = yield* _(
      E.context<
        CreateCredential | RegistrationClient | Capabilities | StorageService | UserService
      >(),
    )

    return RegistrationService.of({
      registerPasskey: flow(registerPasskey, E.provide(context)),
    })
  }),
)
/* v8 ignore stop */
