<template>
    <Dialog>
        <h2>{{title}}</h2>
        <br>
        <p>
            <slot></slot>
        </p>
        <br>
        <p v-if="checkbox">
            <label>
                <input v-model="checkbox_state" type="checkbox"> {{checkbox}}
            </label>
            <br><br>
        </p>
        <p>
            <button class="primary" @click="submit(true)" :disabled="!checkbox_state">
                <i class="fas fa-check fa-fw"></i> {{yes_text}}
            </button>
            <button class="secondary" @click="submit(false)"><i class="fas fa-times fa-fw"></i> {{no_text}}</button>
        </p>
    </Dialog>
</template>

<script>
    import Dialog from "./Dialog.vue";

    export default {
        name: "ConfirmDialog",
        components: {Dialog},
        props: ["title", "yes_text", "no_text", "checkbox"],
        data() {
            return {
                checkbox_state: !this.checkbox
            }
        },
        methods: {
            submit(value) {
                this.$emit("input", value);
            }
        }
    }
</script>

<style scoped>

</style>
