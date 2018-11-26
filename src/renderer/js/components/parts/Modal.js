/*
    A component representing a generic (buttons only) modal
 */
const Modal = Vue.component("ddmm-modal", {
    "template": `
        <div v-if="visible">
            <div class="modal-backdrop"></div>
            <div class="modal">
                <h2>{{title}}</h2>
                <br>
                <div class="modal-content"><slot></slot></div>
                <br>
                <p style="text-align: right;"><span v-for="button in buttons"><button :class="[button.clazz]" @click="$emit('button', button.id)">{{button.text}}</button>&nbsp;</span></p>
            </div>
        </div>
    `,
    "props": ["buttons", "visible", "title"]
});