<!--
  @component
  Accessible email input field that pairs with a Superform.

  Usage:

  ```html
  <InputEmail {form} field="email" label="Email address" autocomplete="email">
    <div slot="description">lorem ipsum dolor sit amet</div>
  </InputEmail>
  ```

  **Important** - pass in a `SuperForm`, not `SuperFormData` i.e.

   ```javascript
  // correct
  const form = superform()
  // wrong
  const { form } = superform()
  ```
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLInputAttributes } from 'svelte/elements'

  import * as Icons from '$lib/icons'

  import { Input } from '$lib/ui/input'

  import { Label } from '$lib/ui/label'

  import { generateId } from './utils'

  import { formFieldProxy, type FormPathLeaves, type SuperForm } from 'sveltekit-superforms'

  type $$Props = Omit<HTMLInputAttributes, 'form'> & {
    form: SuperForm<T>
    field: FormPathLeaves<T>
    label: string
    cols?: number
  }

  export let cols = 1
  $: colSpan = `col-span-${cols}`

  /**
   * Make sure you pass in a raw Superform, i.e. const form = superform(...),
   * not const { form } = superform(...)
   */
  export let form: SuperForm<T>

  /**
   * A field on the form e.g. "email"
   */
  export let field: FormPathLeaves<T>

  /**
   * Display label e.g. "Email address"
   */
  export let label: string

  const { value, errors, constraints } = formFieldProxy(form, field)

  $: invalid = Array.isArray($errors) && $errors.length ? true : undefined
  $: id = `${field}-${generateId()}`
  $: errId = invalid ? `${id}-error` : undefined
</script>

<div class={colSpan}>
  <Label for={id}>{label}</Label>
  <div class="relative">
    <Input
      {id}
      name={field}
      type="email"
      aria-invalid={invalid}
      aria-describedby={errId}
      class="mt-2"
      bind:value={$value}
      {...$constraints}
      {...$$restProps} />

    {#if $errors}
      <div class="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
        <Icons.FieldError class="flex-shrink-0 size-5 text-red-600 dark:text-red-400" />
      </div>
    {/if}
  </div>

  {#if $errors}
    <div id={errId} class="mt-2 text-sm text-red-600 dark:text-red-400">
      <ul>
        {#each $errors as error}
          <li>{error}</li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if $$slots.description}
    <div class="mt-2 text-sm text-base-600 dark:text-base-400">
      <slot name="description" />
    </div>
  {/if}
</div>
