<template>
    <MenuDialog>
        <div class="dialog-menu-description">
            <p><i class="fas fa-user fa-3x"></i></p>
            <br>
            <template v-if="user.display_name">
                <h3>{{user.display_name}}</h3>
                <p>{{user.email}}</p>
            </template>
            <template v-else>
                <h3>{{user.email}}</h3>
            </template>
            <p v-if="user.donated"><strong><i class="fas fa-heart" style="color: red;"></i>
                {{_("renderer.menu_account_settings.description_donated")}}</strong></p>
            <p v-else><strong>{{_("renderer.menu_account_settings.description_free")}}</strong></p>
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item" @click="upgrade">
            <i class="fab fa-patreon fa-fw"></i> {{_("renderer.menu_account_settings.patreon")}}
        </div>
        <div class="dialog-menu-item" @click="changeName">
            <i class="fas fa-pencil-alt fa-fw"></i> {{_("renderer.menu_account_settings.change_name")}}
        </div>
        <div class="dialog-menu-item" @click="resetPassword">
            <i class="fas fa-key fa-fw"></i> {{_("renderer.menu_account_settings.reset_password")}}
        </div>
        <!--<div class="dialog-menu-item" @click="changeEmail">-->
        <!--<i class="fas fa-at fa-fw"></i> {{_("renderer.menu_account_settings.change_email")}}-->
        <!--</div>-->
        <div class="dialog-menu-item" @click="logout">
            <i class="fas fa-sign-out-alt fa-fw"></i> {{_("renderer.menu_account_settings.logout")}}
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item" @click="close">
            <i class="fas fa-times fa-fw"></i> {{_("renderer.menu_account_settings.cancel")}}
        </div>
    </MenuDialog>
</template>

<script>
    import MenuDialog from "../base/MenuDialog.vue";
    import * as firebase from "firebase/app";

    export default {
        name: "AccountSettingsDialog",
        components: {MenuDialog},
        computed: {
            user() {
                return this.$store.state.user;
            }
        },
        methods: {
            _: ddmm.translate,
            upgrade() {
                ddmm.app.openURL("https://patreon.com/ddmm");

                this.close();
            },
            logout() {
                firebase.auth().signOut();
                this.close();
            },
            changeName() {
                this.$store.commit("show_modal", {modal: "account_username"});
                this.close();
            },
            // changeEmail() {
            //     alert("not yet implemented");
            // },
            resetPassword() {
                this.close();
                firebase.auth().sendPasswordResetEmail(this.user.email).then(() => {
                    this.$store.commit("show_modal", {modal: "password_reset_confirmation"});
                });
                // TODO: catch error
            },
            close() {
                this.$store.commit("hide_modal", {modal: "account_settings"});
            }
        }
    }
</script>

<style scoped>

</style>