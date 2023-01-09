<script setup lang="ts">

</script>

<template>
    <main class="Global">
        <div class="Global-container">
            <slot></slot>
        </div>
    </main>
</template>

<style scoped lang="scss">
.Global {
    @apply flex flex-col items-center justify-center;
    @apply w-full h-screen;
    @apply bg-gradient-to-br from-[#ff1166] to-[#ff0932];

    .Global-container {
        @apply block;
        @apply py-9 px-12;
        @apply max-w-screen-lg;
    }
}
</style>
