<script lang="ts">
  import Moon from 'lucide-svelte/icons/moon'
  import Sun from 'lucide-svelte/icons/sun'

  import { Button } from '$lib/ui/button/index.js'
  import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js'
  import { resetMode, setMode } from 'mode-watcher'

  export let mode: 'light' | 'dark' = 'light'

  $: textClass = mode === 'light' ? 'text-primary' : 'text-white'
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button builders={[builder]} variant="ghost" class={textClass} size="icon">
      <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
    <DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
    <DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
