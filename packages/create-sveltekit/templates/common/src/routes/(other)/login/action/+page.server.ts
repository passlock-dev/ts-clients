import { PASSLOCK_API_KEY } from '$env/static/private'
import { PUBLIC_PASSLOCK_ENDPOINT, PUBLIC_PASSLOCK_TENANCY_ID } from '$env/static/public'
import { todos } from '$lib/routes'
import { loginFormSchema } from '$lib/schemas'
import { lucia } from '$lib/server/auth'
import { PasslockError, TokenVerifier } from '@passlock/sveltekit'
import { error, fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { valibot } from 'sveltekit-superforms/adapters'
import type { Actions } from './$types'

const tokenVerifier = new TokenVerifier({
  tenancyId: PUBLIC_PASSLOCK_TENANCY_ID,
  apiKey: PASSLOCK_API_KEY,
  endpoint: PUBLIC_PASSLOCK_ENDPOINT
})

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, valibot(loginFormSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    // Verify the Passlock token is genuine
    const principal = await tokenVerifier.exchangeUserToken(form.data.token)
    if (PasslockError.isError(principal)) error(500, principal.message)

    const session = await lucia.createSession(principal.sub, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',
      ...sessionCookie.attributes
    })

    redirect(302, todos)
  }
} satisfies Actions
