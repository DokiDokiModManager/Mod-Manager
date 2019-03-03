const ChunkyRadioButtons = Vue.component("ddmm-chunky-radio-buttons", {
    "template": ``,
    "methods": {
        "setValue": function (val) {
            this.value = val;
            this.$emit("input", val);
        }
    },
    "props": ["options", "value"]
});