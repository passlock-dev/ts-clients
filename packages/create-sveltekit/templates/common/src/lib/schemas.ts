import * as v from 'valibot'

export const registrationFormSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  givenName: v.pipe(v.string(), v.minLength(2)),
  familyName: v.pipe(v.string(), v.minLength(2)),
  acceptTerms: v.boolean(),
  token: v.string(),
  authType: v.picklist(['passkey', 'email', 'apple', 'google']),
  verifyEmail: v.optional(v.picklist(['link', 'code']))
})

export type RegistrationFormSchema = typeof registrationFormSchema

export const loginFormSchema = v.object({
  email: v.optional(v.pipe(v.string(), v.email())),
  token: v.string(),
  authType: v.picklist(['passkey', 'email', 'apple', 'google'])
})

export type LoginFormSchema = typeof loginFormSchema

export const verifyEmailSchema = v.object({
  code: v.string(),
  token: v.string()
})

export type VerifyEmailSchema = typeof verifyEmailSchema

export const todoSchema = v.object({
  text: v.string()
})

export type TodoSchema = typeof todoSchema
