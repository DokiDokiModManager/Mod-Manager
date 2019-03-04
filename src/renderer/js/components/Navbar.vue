<template>
    <div class="navbar">
        <div class="nav-links">
            <div v-for="t in tabs" :class="{'active': t.id === tab}" @click="setTab(t)">{{t.name}}</div>
        </div>
    </div>
</template>

<script>
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
                this.tab = t.id;
                this.$emit("tab", t);
            }
        }
    }
</script>

<style scoped>

</style>