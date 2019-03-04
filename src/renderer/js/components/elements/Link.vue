<template>
    <a href="#" @click="openURL(to)"><slot></slot></a>
</template>

<script>
    export default {
        name: "Link",
        props: ["to"],
        methods: {
            openURL: ddmm.app.openURL
        }
    }
</script>

<style scoped>

</style>