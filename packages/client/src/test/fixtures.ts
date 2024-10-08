import { Effect as E, Layer as L } from 'effect'

import { BadRequest } from '@passlock/shared/dist/error/error.js'
import type { Principal } from '@passlock/shared/dist/schema/principal.js'

import { Capabilities } from '../capabilities/capabilities.js'
import { StorageService, type StoredToken } from '../storage/storage.js'

export const session = 'session'
export const token = 'token'
export const code = 'code'
export const authType = 'passkey'
export const expiry = Date.now() + 10000

export const principal: Principal = {
  jti: 'token',
  token: 'token',
  sub: 'user-1',
  iss: 'idp.passlock.dev',
  aud: 'tenancy_id',
  iat: new Date(),
  nbf: new Date(),
  exp: new Date(Date.now() + 5 * 60 * 1000),
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

export const capabilitiesTest = L.succeed(
  Capabilities,
  Capabilities.of({
    passkeySupport: E.void,
    isPasskeySupport: E.succeed(true),
    autofillSupport: E.void,
    isAutofillSupport: E.succeed(true),
  }),
)

export const storedToken: StoredToken = { token, authType, expiry }

export const storageServiceTest = L.succeed(
  StorageService,
  StorageService.of({
    storeToken: () => E.void,
    getToken: () => E.succeed(storedToken),
    clearToken: () => E.void,
    clearExpiredToken: () => E.void,
    clearExpiredTokens: E.void,
  }),
)

export const notImplemented = new BadRequest({ message: 'Not implemented' })
