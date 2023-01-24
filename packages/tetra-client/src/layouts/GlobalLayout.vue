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
    @apply bg-gradient-to-br from-[#1E1E28] to-[#14141c];

    .Global-container {
        @apply block;
        @apply py-9 px-12;
        @apply max-w-screen-lg;
    }
}
</style>
