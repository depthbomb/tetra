<script setup lang="ts">
import { reactive, defineAsyncComponent } from 'vue';
import { isValidHttpUrl }                 from '~/utils';
import { useTetraStore }                  from '~/stores/tetra';
import HomeFooter                         from '~/components/Home/HomeFooter.vue';

const LinkIcon          = defineAsyncComponent(() => import('~/components/icons/LinkIcon.vue'));
const PaperPlaneTopIcon = defineAsyncComponent(() => import('~/components/icons/PaperPlaneTopIcon.vue'));

const store = useTetraStore();
const state = reactive({
    valid: false,
    submitDisabled: true,
    destination: '',
});

const validateInput = () => {
    state.valid = isValidHttpUrl(state.destination);
    state.submitDisabled = !state.valid;
};

const trySubmit = async () => {
    state.submitDisabled = true;

    const res = await fetch('api/create', {
        method: 'PUT',
        body: JSON.stringify({ destination: state.destination }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': store.csrfToken
        }
    });
    const { success, results } = await res.json();

    state.submitDisabled = false;
    state.destination = '';

    if (success) {
        window.location.href = `${results}+`;
    }
};
</script>

<template>
    <router-link :to="{ name: 'home' }" class="Header">&lt;title here&gt;</router-link>
    <div class="InputContainer">
        <LinkIcon class="w-9 text-gray-300"/>
        <input
            @input="validateInput"
            type="url"
            name="destination"
            :class="['Input', {
                'Input--invalid': !state.valid && state.destination !== '',
                'Input--valid': state.valid
            }]"
            autocomplete="off"
            autofocus
            v-model.trim="state.destination">
        <button
            @click="trySubmit"
            type="button"
            class="SubmitButton"
            role="button"
            :disabled="state.submitDisabled || state.destination === ''">
            <span>Submit</span>
            <PaperPlaneTopIcon class="inline-block ml-2 w-5"/>
        </button>
    </div>
    <HomeFooter/>
</template>

<style scoped lang="scss">
.Header {
    @apply block;
    @apply mb-6;
    @apply text-7xl text-white text-center;
    @apply font-serif;
    @apply drop-shadow;
}

.InputContainer {
    @apply flex flex-row items-center;
    @apply w-[720px];
    @apply py-3 px-4;
    @apply bg-white;
    @apply rounded-full;
    @apply shadow;

    .Input {
        @apply grow;
        @apply text-xl text-center font-bold;
        @apply overflow-ellipsis;
        @apply bg-transparent;
        @apply border-none;
        @apply outline-none;
        @apply ring-0 ring-offset-0;

        &.Input--valid {
            @apply text-green-500;
        }

        &.Input--invalid {
            @apply text-red-500;
        }
    }

    .SubmitButton {
        @apply shrink-0;
        @apply inline-block;
        @apply items-center;
        @apply ml-3;
        @apply py-3 px-4;
        @apply text-lg text-white;
        @apply bg-brand-500;
        @apply rounded-full;
        @apply shadow;
        @apply transition-all;

        @apply hover:text-white hover:bg-brand-400;
        @apply active:bg-brand-600;
        @apply focus:ring focus:ring-brand focus:ring-offset-2;
        @apply disabled:opacity-75 disabled:cursor-not-allowed;
    }
}
</style>
