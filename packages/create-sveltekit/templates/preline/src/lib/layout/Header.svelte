<script lang="ts">
  import { beforeNavigate } from '$app/navigation'
  import type { User } from 'lucia'
  import { slide } from 'svelte/transition'

  import MenuBar from './MenuBar.svelte'
  import MobileMenu from './MobileMenu.svelte'
  import MobileMenuBar from './MobileMenuBar.svelte'

  export let user: User | null
  let menuOpen = false

  beforeNavigate(() => {
    // close the menu
    menuOpen = false
  })
</script>

<header class="flex-none flex flex-wrap sm:justify-start sm:flex-nowrap w-full text-sm py-4">
  <nav class="relative w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between" aria-label="Global">
    <div class="flex items-center justify-between">
      <a class="flex-none text-xl font-semibold text-base-800 dark:text-base-100" href="/">Acme Inc.</a>

      <div class="flex items-center gap-4 sm:hidden">
        <MobileMenuBar {user} bind:menuOpen />
      </div>
    </div>

    <!-- Mobile dropdown -->
    {#if menuOpen}
      <div
        transition:slide
        class="absolute left-0 px-4 pb-6 w-full grow sm:hidden z-10 bg-white dark:bg-slate-950 border-b dark:border-slate-700">
        <MobileMenu {user} />
      </div>
    {/if}

    <!-- Desktop menu -->
    <div class="hidden grow sm:block">
      <MenuBar {user} />
    </div>
  </nav>
</header>
