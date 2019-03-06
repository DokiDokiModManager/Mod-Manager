<template>
    <Dialog>
        <h2>{{title}}</h2>
        <br>
        <p><slot></slot></p>
        <br>
        <p><button class="primary" @click="submit(true)"><i class="fas fa-check fa-fw"></i> {{yes_text}}</button> <button class="secondary" @click="submit(false)"><i class="fas fa-times fa-fw"></i> {{no_text}}</button></p>
    </Dialog>
</template>

<script>
    import Dialog from "./Dialog.vue";

    export default {
        name: "ConfirmDialog",
        components: {Dialog},
        props: ["title", "yes_text", "no_text"],
        methods: {
            submit(value) {
                this.$emit("input", value);
            }
        }
    }
</script>

<style scoped>

</style>