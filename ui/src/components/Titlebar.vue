<template>
    <div class="titlebar">
        <div class="app-title">
            <span>{{app_name}}</span>
            <small>v{{app_version}} (<Link :to="'https://help.doki.space/changelog/v' + app_version.replace(/\./g, '_')">{{_("renderer.version.link_changelog")}}</Link>)
            </small>
        </div>

        <div class="window-buttons">
            <template v-if="!system_borders">
                <div class="button" @click="windowMinimise" :title="_('renderer.window_controls.minimise')"><i
                        class="far fa-window-minimize fa-fw"></i></div>
                <div class="button" @click="windowMaximise" :title="_('renderer.window_controls.maximise')"><i
                        class="far fa-window-maximize fa-fw"></i></div>
                <div class="button" @click="windowClose" :title="_('renderer.window_controls.close')"><i
                        class="fas fa-times fa-fw"></i></div>
            </template>
        </div>
    </div>
</template>
<script>
    import Link from "./elements/Link.vue";

    export default {
        name: 'Titlebar',
        components: {Link},
        props: ["app_name", "app_version", "system_borders"],
        methods: {
            _: ddmm.translate,
            windowClose: ddmm.window.close,
            windowMinimise: ddmm.window.minimise,
            windowMaximise: ddmm.window.maximise,
        }
    }
</script>
