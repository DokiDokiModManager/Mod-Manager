<template>
    <div class="chunky-radio-buttons">
        <div v-for="(opt, id) in options" :class="{'chunky-button': true, 'active': val === id}"
             @click="setValue(id)">{{opt}}
        </div>
    </div>
</template>

<script>
    export default {
        name: "ChunkyRadioButtons",
        props: ["options", "value"],
        data() {
            return {
                val: this.value
            }
        },
        methods: {
            setValue(val) {
                this.val = val;
                this.$emit("input", val);
            }
        }
    }
</script>

<style scoped>

</style>