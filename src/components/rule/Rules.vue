<template>
    <div class="rule-main flex flex-col items-center">
        <RulesAdd @add="addOneRule"/>
        <Loader v-if="loading"/>
        <div v-for="(rule, i) in rules" :key="i" v-else>
            <button class="notebook bg-blue-500 p-1 mt-1">
                {{rule.name}}
            </button>
            <button class="notebook bg-red-400 p-1 ml-5" @click="deleteOneRule(rule)">
                DELETE
            </button>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from "vue"
    import { mapGetters, mapActions } from 'vuex'
    import { IRule } from "@/types"
    import Loader from "./Loader.vue"
    import RulesAdd from "./RulesAdd.vue"

    export default defineComponent({
        props: {
            loading: {
                type: Boolean,
                default: () => false
            },
        },
        components: {
            Loader,
            RulesAdd
        },
        data() {
            return {

            }
        },
        computed: {
            ...mapGetters(['rules']),
        },
        methods: {
            ...mapActions(['getRules', 'addRule', 'deleteRule']),
            addOneRule(name:string) {
                this.addRule({ name, condition: [], action: null })
                this.getRules()
            },
            deleteOneRule(rule: IRule) {
                this.deleteRule(rule.id)
            },
        },
    })
    </script>

<style lang="scss" scoped>

</style>
