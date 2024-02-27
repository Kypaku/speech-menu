<template>
    <div class="role-add input-form flex-center">
        <input
            type="text"
            v-model="name"
            :placeholder="placeholder"
            class="border-2 border-gray-300 bg-gray-700 p-1 flex-grow text-black rounded-l"
            @keypress.enter="add"/>
        <button class="bg-gray-700 p-1 text-black border-2 border-gray-300 bg-blue-900 text-white rounded-r" :disabled="!name" @click="add">Add</button>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'

    export default defineComponent({
        props: {
            placeholder: {
                type: String,
                default: () => "Name"
            },
        },
        components: {

        },
        data() {
            return {
                name: "",

            }
        },
        computed: {

        },
        methods: {
            add() {
                this.name && this.$emit('add', this.name)
                this.name = ''
            },
        },
    })

    </script>

<style lang="scss" scoped>

</style>
