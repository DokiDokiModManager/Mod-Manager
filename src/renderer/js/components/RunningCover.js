/*
    A component representing the running cover that is shown when the game is running
 */
const RunningCover = Vue.component("ddmm-running-cover", {
    "template": `
<div class="cover" v-if="display">
    <h1>{{title}}</h1>
    <p>{{description}}</p>
    <div v-if="dismissable">
        <button @click="$emit('dismissed')" class="danger">close this (untranslated)</button>
    </div>
</div>
        `,
    "props": ["display", "dismissable", "title", "description"]
});