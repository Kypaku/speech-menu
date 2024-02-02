import { toRaw } from 'vue'
import { RulesState } from './modules/rules'
import { IRule } from "@/types"

interface State {
    rules: RulesState
}

export default {
    rules: (state: State): IRule[] => toRaw(state.rules.rules)
}
