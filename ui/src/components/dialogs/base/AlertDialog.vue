<template>
    <Dialog>
        <h2>{{title}}</h2>
        <br>
        <p>
            <slot></slot>
        </p>
        <br>
        <p>
            <button class="primary" @click="submit()"><i class="fas fa-check fa-fw"></i> {{button_text}}</button>
        </p>
    </Dialog>
</template>

<script>
    import Dialog from "./Dialog.vue";

    export default {
        name: "AlertDialog",
        props: ["button_text", "title", "modal_id"],
        components: {Dialog},
        methods: {
            submit() {
                this.$store.commit("hide_modal", {modal: this.modal_id});
            }
        }
    }
</script>

<style scoped>

</style>