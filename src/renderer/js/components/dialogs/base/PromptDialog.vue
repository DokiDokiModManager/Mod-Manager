<template>
    <Dialog>
        <h2>{{title}}</h2>
        <br>
        <p><slot></slot></p>
        <br>
        <p><input type="text" :placeholder="placeholder" v-model="input"></p>
        <br>
        <p><button class="primary" @click="submit(input)"><i class="fas fa-check fa-fw"></i> {{submit_text}}</button> <button class="secondary" @click="submit(null)"><i class="fas fa-times fa-fw"></i> {{cancel_text}}</button></p>
    </Dialog>
</template>

<script>
    import Dialog from "./Dialog.vue";

    export default {
        name: "PromptDialog",
        components: {Dialog},
        props: ["title", "placeholder", "value", "submit_text", "cancel_text"],
        methods: {
            submit(value) {
                this.$emit("input", value);
            }
        },
        data() {
            return {
                input: this.value
            };
        }
    }
</script>

<style scoped>

</style>