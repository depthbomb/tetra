<script setup lang="ts">
import { reactive }                 from 'vue';
import { isValidHttpUrl }           from '~/utils';
import { useTetraStore }            from '~/stores/tetra';
import { makeApiRequest }           from '~/services/api';
import LinkIcon                     from '~/components/icons/LinkIcon.vue';
import HomeFooter                   from '~/components/Home/HomeFooter.vue';
import PaperPlaneTopIcon            from '~/components/icons/PaperPlaneTopIcon.vue';
import type { ICreateLinkResponse } from '~/@types/ICreateLinkResponse';

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

    makeApiRequest<ICreateLinkResponse>('api.links.create', {
        method: 'PUT',
        body: JSON.stringify({ destination: state.destination })
    }).then(({ results }) => {
        window.location.href = `${results}+`;
    }).catch(err => {
        // TODO handle
        console.error(err);
    });

    state.submitDisabled = false;
    state.destination = '';
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
