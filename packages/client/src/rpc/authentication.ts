import { Context, Effect as E, Layer } from 'effect'

import {
  type AuthenticationService,
  OPTIONS_ENDPOINT,
  OptionsErrors,
  OptionsReq,
  OptionsRes,
  VERIFY_ENDPOINT,
  VerificationErrors,
  VerificationReq,
  VerificationRes,
} from '@passlock/shared/dist/rpc/authentication.js'

import { Dispatcher, makePostRequest } from './client.js'

/* Client */

export class AuthenticationClient extends Context.Tag('@passkey/auth/client')<
  AuthenticationClient,
  AuthenticationService
>() {}

export const AuthenticationClientLive = Layer.effect(
  AuthenticationClient,
  E.gen(function* (_) {
    const dispatcher = yield* _(Dispatcher)

    const optionsResolver = makePostRequest(OptionsReq, OptionsRes, OptionsErrors, dispatcher)

    const verifyResolver = makePostRequest(
      VerificationReq,
      VerificationRes,
      VerificationErrors,
      dispatcher,
    )

    return {
      getAuthenticationOptions: req => optionsResolver(OPTIONS_ENDPOINT, req),
      verifyAuthenticationCredential: req => verifyResolver(VERIFY_ENDPOINT, req),
    }
  }),
)
