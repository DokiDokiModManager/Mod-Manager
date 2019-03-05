<template>
    <div class="navbar">
        <div class="nav-links">
            <div v-for="t in tabs" :class="{'active': t.id === tab}" @click="setTab(t)">{{t.name}}</div>
        </div>
    </div>
</template>

<script>
    import Logger from "../utils/Logger";

    export default {
        name: "Navbar",
        props: ["tabs"],
            data: function () {
            return {
                tab: this.tabs[0].id
            }
        },
        methods: {
            setTab: function (t) {
                Logger.info("Navbar", "Navigated to tab " + t.id);
                this.tab = t.id;
                this.$emit("tab", t);
            }
        }
    }
</script>

<style scoped>

</style>