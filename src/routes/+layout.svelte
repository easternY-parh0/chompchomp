<script lang="ts">
  import { navigating } from '$app/stores';
  import ChompLoader from '$lib/components/ChompLoader.svelte';
  let { children } = $props();
</script>

<ChompLoader active={!!$navigating} />

{@render children()}