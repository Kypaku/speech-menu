import { Commit, Dispatch } from 'vuex'
import { api } from '../../api/fileApi'
import { IRule } from "@/types"

export interface RulesState {
    rules: IRule[]
}

export default {
    state(): RulesState {
        const state = {
            rules: []
        } as RulesState
        return state
    },
    mutations: {
        SET_RULES: (state: RulesState, rules: IRule[]): void => {
            state.rules = rules
        },
        ADD_RULE: (state: RulesState, rule: IRule): void => {
            state.rules.push(rule)
        },
        DELETE_RULE: (state: RulesState, id: string): void => {
            state.rules = state.rules.filter(rule => rule.id !== id)
        },
        UPDATE_RULE: (state: RulesState, rule: IRule): void => {
            const findedIndex = state.rules.findIndex(el => el.id === rule.id)
            const updateRules = state.rules.splice(findedIndex, 1, rule)
            state.rules = updateRules
        }
    },
    actions: {
        async getRules({ commit }: { commit: Commit }): Promise<void> {
            try {
                const res = api.get() as IRule[]
                commit('SET_RULES', res)
            } catch (e) {
                throw 'Rules failed: ' + e
            }
        },
        async addRule({ commit }: { commit: Commit}, rule: IRule): Promise<void> {
            try {
                rule.id = `${+new Date() + '_' + Math.random().toString(36).substr(2, 9)}`
                api.add(rule)
                commit('ADD_RULE', rule)
            } catch (e) {
                throw 'Rules failed: ' + e
            }
        },
        async deleteRule({ commit }: { commit: Commit}, id: string): Promise<void> {
            try {
                api.delete(id)
                commit('DELETE_RULE', id)
            } catch (e) {
                throw 'Rules failed: ' + e
            }
        },
        async updateRule({ commit, dispatch }: { commit: Commit, dispatch: Dispatch }, rule: IRule): Promise<void> {
            try {
                api.update(rule)
                commit('UPDATE_RULE', rule)
                dispatch('getRules')
            } catch (e) {
                throw 'Rules failed: ' + e
            }
        }
    }
}
