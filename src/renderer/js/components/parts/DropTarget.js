/*
    A component representing a drop target
 */
const DropTarget = Vue.component("ddmm-drop-target", {
    "template": `
<div :class="{'drop-target': true, 'dragging': dragging}" @dragover="allowDrop" @dragenter="allowDrop" @dragexit="endDrag" @dragleave="dragging = false" @dragend="endDrag" @drop="handleDrop" @click="$emit('click')">
    <p><i class="fas fa-download fa-2x"></i></p>
    <p>{{_("mods.description_drop")}}</p>
</div>`,
    "data": function () {
        return {
            "dragging": false
        }
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "allowDrop": function (e) {
            this.dragging = true;
            e.dataTransfer.dropEffect = "copy";
            e.preventDefault();
            e.stopPropagation();
        },
        "endDrag": function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Not dragging.");
        },
        "handleDrop": function (e) {
            e.preventDefault();
            this.dragging = false;
            this.$emit("files", e.dataTransfer.files);
        }
    }
});