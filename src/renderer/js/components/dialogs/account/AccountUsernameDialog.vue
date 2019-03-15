<template>
    <PromptDialog :title="_('renderer.modal_change_username.title')" :placeholder="install.name"
                  :submit_text="_('renderer.modal_change_username.button_affirmative')"
                  :cancel_text="_('renderer.modal_change_username.button_negative')"
                  @input="rename"
    >
        {{_("renderer.modal_change_username.body")}}
    </PromptDialog>
</template>

<script>
    import * as firebase from "firebase/app";

    import PromptDialog from "../base/PromptDialog.vue";

    export default {
        name: "AccountUsernameDialog",
        components: {PromptDialog},
        methods: {
            _: ddmm.translate,
            rename(newName) {
                this.$store.commit("hide_modal", {modal: "account_username"});
                if (newName && newName.length > 2) {
                    firebase.auth().currentUser.updateProfile({
                        displayName: newName
                    }).then(() => {
                        this.$store.commit("login", {display_name: newName});
                    });
                }
            }
        },
        computed: {
            install() {
                return this.$store.state.selected_install;
            }
        },
    }
</script>

<style scoped>

</style>