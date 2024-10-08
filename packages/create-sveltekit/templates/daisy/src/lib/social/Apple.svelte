<!-- 
  @component
  
  Displays a `Sign in with Apple` button.

  ## Apple Client ID
  **IMPORTANT**: You will need to enter your Apple Client ID in your Passlock
  settings - https://console.passlock.dev/settings (near the bottom under 
  'Social Login'). You will also need to run your app (even during development)
  on a publicly accessible https url. We recommend something like ngrok.

  Also please ensure PUBLIC_APPLE_CLIENT_ID and PUBLIC_APPLE_REDIRECT_URL are
  set in your .env file. We don't actually use redirects, but Apple still requires
  us to provide the URL during the call and it must align with one of the website 
  URLs associated with the service ID A.K.A Client ID.

  ## Passlock integration
  When the user signs in, this component interacts with the Passlock backend 
  to register or authenticate the user. Passlock will handle the id_token 
  verification. Following a successful sign up event you should see a new 
  user in your Passlock console. 

  ## Duplicate accounts warnings
  If the user tries to register or sign in with their Apple account but they 
  already registered a passkey (with the same email address) they will be prompted 
  to authenticate using their passkey instead.
-->
<script lang="ts">
  import {
    PUBLIC_APPLE_CLIENT_ID,
    PUBLIC_PASSLOCK_CLIENT_ID,
    PUBLIC_PASSLOCK_ENDPOINT,
    PUBLIC_PASSLOCK_TENANCY_ID
  } from '$env/static/public'

  import * as Icons from '$lib/icons'
  import { Apple, type AppleOptions, type Context } from '@passlock/sveltekit/components/social'

  export let context: Context = 'signin'

  // The parent component renders a spinner when it's calling out
  // to Apple or Passlock. This can also be used during form submission
  // to a backend +page.server.ts by flipping the submitting flag
  export let submitting = false

  export let disabled = false

  let options: AppleOptions
  $: options = {
    tenancyId: PUBLIC_PASSLOCK_TENANCY_ID,
    clientId: PUBLIC_PASSLOCK_CLIENT_ID,
    endpoint: PUBLIC_PASSLOCK_ENDPOINT,
    context: context,
    apple: {
      clientId: PUBLIC_APPLE_CLIENT_ID
    }
  }

  $: message = options.context === 'signup' ? 'Sign up with Apple' : 'Sign in with Apple'
</script>

<!-- Note: let syntax is a way of passing stuff from the base component down to this one -->
<!-- We're binding the parents 'submitting' variable to our 'submittingToPasslock' one -->
<Apple {options} let:click let:submitting={parentSubmitting} on:principal>
  <!-- 
    Note: 
    parentSubmitting - Base component is making a request to the Apple or Passlock APIs.
    submitting - The page that uses THIS component is making a request to the 
    +page.server.ts action
  -->
  <button
    type="button"
    on:click={click}
    disabled={submitting || parentSubmitting || disabled}
    class="btn btn-neutral w-full py-3 px-4">
    {#if submitting || parentSubmitting}
      <Icons.Spinner class="size-5 animate-spin-slow" />
    {:else}
      <Icons.Apple class="size-5 fill-current" />
    {/if}
    {message}
  </button>

  <svelte:fragment slot="error" let:error>
    {#if error}
      <div class="label">
        <span class="text-sm text-error">{error}</span>
      </div>
    {/if}
  </svelte:fragment>
</Apple>
