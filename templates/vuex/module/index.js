const moduleStore = {
    namespaced: true,
    state:{
        account:1
    },
    mutations:{
        ADD_ACCOUNT:(state, count) =>{
            state.account = count+1
        }
    },
    actions:{
        addAccount({commit}, data) {
            commit('ADD_ACCOUNT', data)
        }
    },
    getters:{

    }
}
export default moduleStore