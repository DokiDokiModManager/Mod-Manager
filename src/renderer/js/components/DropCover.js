/*
    A component representing the cover that appears when a mod is being dragged into the app
 */
const DropCover = Vue.component("ddmm-drop-cover", {
    "template": `
<div class="cover" v-if="display">
    <h1>drag and drop thing</h1>
    <p>reee</p>
</div>
        `,
    "props": ["display"]
});