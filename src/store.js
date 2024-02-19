import { createStore } from 'vuex';

export default createStore({
    state: {
        showAlert: false,
        progress: 100,
        duration: 3000,
        message: '',
    },
    mutations: {
        setShowAlert(state, value) {
            state.showAlert = value;
        },
        showAlertWithProgress(state, message) {
            state.showAlert = true;
            state.progress = 100;
            state.message = message;
            let interval = setInterval(() => {
                state.progress -= 1;
                if (state.progress <= 0) {
                    clearInterval(interval);
                    state.showAlert = false;
                }
            }, state.duration / 100);
        },
    },
});