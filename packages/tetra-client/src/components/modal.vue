<script setup lang="ts">
    const props = defineProps({
        show: Boolean
    });
</script>

<template>
    <Transition name="modal">
        <div v-if="show" class="Modal-backdrop" @click="$emit('close')">
            <div class="Modal-container">
                <div class="Modal-body">
                    <slot name="body">Modal</slot>
                </div>
                <div class="Modal-footer">
                    <button class="Button" @click="$emit('close')">Close</button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
    .Modal-backdrop {
        @apply fixed;
        @apply z-[9998];
        @apply top-0 left-0;
        @apply flex justify-center items-center;
        @apply w-full h-full;
        @apply bg-black bg-opacity-50;
        @apply transition-opacity ease-in-out;
    }

    .Modal-container {
        @apply my-0 mx-auto;
        @apply py-5 px-7;
        @apply w-80;
        @apply bg-white;
        @apply shadow;
        @apply transition-all ease-in-out;
    }

    .Modal-body {
        @apply my-5;
    }

    .modal-enter-from {
        @apply opacity-0;
    }

    .modal-leave-to {
        @apply opacity-0;
    }

    .modal-enter-from .Modal-container,
    .modal-leave-to .Modal-container {
        transform: scale(1.1);
    }
</style>
