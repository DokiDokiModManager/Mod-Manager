/*
    A component representing a navigation button for the sidebar
 */
Vue.component("ddmm-nav-button", {
    template: `
<div :class="{'nav-button': true, 'active': active}">
    <i :class="['fas', 'fa-2x', 'fa-fw', 'fa-' + icon]"></i>
    <p><slot></slot></p>
</div>
    `,
    "props": ["icon", "active"]
});