const ChunkyRadioButtons = Vue.component("ddmm-chunky-radio-buttons", {
    "template": `<div class="chunky-radio-buttons">
    <div v-for="(opt, id) in options" :class="{'chunky-button': true, 'active': value === id}" @click="setValue(id)">{{opt}}</div>
</div>`,
    "methods": {
        "setValue": function (val) {
            this.value = val;
            this.$emit("input", val);
        }
    },
    "props": ["options", "value"]
});