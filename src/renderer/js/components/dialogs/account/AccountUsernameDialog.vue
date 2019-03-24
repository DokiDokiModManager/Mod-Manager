<template>
    <PromptDialog :title="_('renderer.modal_change_username.title')"
                  :submit_text="_('renderer.modal_change_username.button_affirmative')"
                  :cancel_text="_('renderer.modal_change_username.button_negative')"
                  @input="rename"
    >
        <p>{{_("renderer.modal_change_username.body")}}</p>

        <div v-if="invalid">
            <br>
            <p><strong>{{_("renderer.modal_change_username.description_invalid")}}</strong></p>
        </div>
    </PromptDialog>
</template>

<script>
    import * as firebase from "firebase/app";

    import PromptDialog from "../base/PromptDialog.vue";

    export default {
        name: "AccountUsernameDialog",
        components: {PromptDialog},
        data: function() {
            return {
                invalid: false
            }
        },
        methods: {
            _: ddmm.translate,
            rename(newName) {
                if (newName && newName.length > 2) {
                    this.$store.commit("hide_modal", {modal: "account_username"});
                    firebase.auth().currentUser.updateProfile({
                        displayName: newName
                    }).then(() => {
                        this.$store.commit("login", {display_name: newName});
                    });
                } else if (newName !== null) {
                    this.invalid = true;
                } else {
                    this.$store.commit("hide_modal", {modal: "account_username"});
                }
            }
        }
    }
</script>

<style scoped>

</style>