<template>
    <Dialog>
        <h2>{{_("renderer.modal_login.title")}}</h2>
        <br>
        <p>{{_("renderer.modal_login.description", _("renderer.modal_login.link_forgot"))}}</p>
        <div class="form-group">
            <p><label>{{_("renderer.modal_login.label_email")}}</label></p>
            <p><input type="email" :placeholder="_('renderer.modal_login.label_email')" v-model="email"></p>
        </div>
        <div class="form-group">
            <p><label>{{_("renderer.modal_login.label_password")}}</label></p>
            <p><input type="password" :placeholder="_('renderer.modal_login.label_password')" v-model="password"></p>
        </div>
        <p>
            <Link to="https://app.doki.space/reset">{{_("renderer.modal_login.link_forgot")}}</Link>
        </p>
        <br>
        <p>
            <Link to="https://app.doki.space/register">{{_("renderer.modal_login.link_register")}}</Link>
        </p>
        <br>
        <p>
            <button class="primary" @click="submit(email, password)"><i class="fas fa-check fa-fw"></i>
                {{_("renderer.modal_login.button_login")}}
            </button>
            <button class="secondary" @click="cancel()"><i class="fas fa-times fa-fw"></i>
                {{_("renderer.modal_login.button_cancel")}}
            </button>
        </p>
        <template v-if="error">
            <br>
            <p><strong>{{error}}</strong></p>
        </template>
    </Dialog>
</template>

<script>
    import * as firebase from "firebase/app";

    import Logger from "../../../utils/Logger";

    import Dialog from "../base/Dialog.vue";
    import Link from "../../elements/Link.vue";

    export default {
        name: "LoginDialog",
        components: {Link, Dialog},
        methods: {
            _: ddmm.translate,
            submit(email, password) {
                if (email && password) {
                    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
                        this.$store.commit("hide_modal", {modal: "login"});
                    }).catch(err => {
                        Logger.warn("Firebase", "Failed to log in");
                        Logger.warn("Firebase", err);
                        switch (err.code) {
                            case "auth/invalid-email":
                                this.error = ddmm.translate("renderer.modal_login.error_invalid_email");
                                break;
                            case "auth/user-disabled":
                                this.error = ddmm.translate("renderer.modal_login.error_disabled");
                                break;
                            case "auth/user-not-found":
                                this.error = ddmm.translate("renderer.modal_login.error_no_account");
                                break;
                            case "auth/wrong-password":
                                this.error = ddmm.translate("renderer.modal_login.error_password");
                                break;
                            default:
                                this.error = ddmm.translate("renderer.modal_login.error_unknown");
                                break;
                        }
                    });
                } else {
                    this.error = ddmm.translate("renderer.modal_login.error_incomplete");
                }
            },
            cancel() {
                this.$store.commit("hide_modal", {modal: "login"});
            }
        },
        data() {
            return {
                email: "",
                password: "",
                error: ""
            }
        }
    }
</script>

<style scoped>

</style>