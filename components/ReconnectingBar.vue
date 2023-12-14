<template lang="html">
  <div class="bg-yellow-color2 flex w-full items-center justify-center">
    <p>{{ props.reason }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['reason'])
</script>

<style lang="postcss" scoped></style>
