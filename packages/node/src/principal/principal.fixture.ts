import * as S from '@effect/schema/Schema'
import { Context, Effect as E, Layer as L, LogLevel, Logger, Ref, Stream, pipe } from 'effect'
import type { RequestOptions } from 'https'

import { Principal } from '@passlock/shared/dist/schema/principal.js'

import { Config } from '../config/config.js'
import {
  type PrincipalService,
  PrincipalServiceLive,
  StreamResponse,
  buildError,
} from './principal.js'

export const principal: Principal = {
  jti: 'token',
  token: 'token',
  sub: 'user-1',
  iss: 'idp.passlock.dev',
  aud: 'tenancy_id',
  // must be at least 1 second
  // as it's truncated to seconds
  iat: new Date(60 * 1000),
  nbf: new Date(120 * 100),
  exp: new Date(180 * 1000),
  email: 'john.doe@gmail.com',
  givenName: 'john',
  familyName: 'doe',
  emailVerified: false,
  authType: 'passkey',
  authId: 'auth-1',
  userVerified: true,
  // legacy
  user: {
    id: 'user-1',
    givenName: 'john',
    familyName: 'doe',
    email: 'john.doe@gmail.com',
    emailVerified: false,
  },
  authStatement: {
    authType: 'passkey',
    userVerified: false,
    authTimestamp: new Date(0),
  },
  expireAt: new Date(0),
}

export const tenancyId = 'tenancyId'
export const apiKey = 'apiKey'

export const configTest = L.succeed(Config, Config.of({ tenancyId, apiKey }))

export class State extends Context.Tag('State')<State, Ref.Ref<RequestOptions | undefined>>() {}

export const buildEffect = <A, E>(
  assertions: E.Effect<A, E, PrincipalService | State>,
): E.Effect<void, E> => {
  const streamResponseTest = L.effect(
    StreamResponse,
    E.gen(function* (_) {
      const ref = yield* _(State)
      const res = S.encodeSync(Principal)(principal)
      const buff = Buffer.from(JSON.stringify(res))

      return {
        streamResponse: options =>
          pipe(Stream.fromEffect(Ref.set(ref, options)), Stream.zipRight(Stream.make(buff))),
      }
    }),
  )

  const service = pipe(PrincipalServiceLive, L.provide(streamResponseTest), L.provide(configTest))

  const args = L.effect(State, Ref.make<RequestOptions | undefined>(undefined))

  const effect = pipe(
    E.provide(assertions, service),
    E.provide(args),
    Logger.withMinimumLogLevel(LogLevel.None),
  )

  return effect
}

export const buildErrorEffect =
  (statusCode: number) =>
  <A>(assertions: E.Effect<void, A, PrincipalService>): E.Effect<void, A> => {
    const streamResponseTest = L.succeed(
      StreamResponse,
      StreamResponse.of({
        streamResponse: () => Stream.fail(buildError({ statusCode })),
      }),
    )

    const service = pipe(PrincipalServiceLive, L.provide(streamResponseTest), L.provide(configTest))

    const args = L.effect(State, Ref.make<RequestOptions | undefined>(undefined))

    const effect = pipe(
      E.provide(assertions, service),
      E.provide(args),
      Logger.withMinimumLogLevel(LogLevel.None),
    )

    return effect
  }
