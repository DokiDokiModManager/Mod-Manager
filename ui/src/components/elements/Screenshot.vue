<template>
    <img :src="realSrc" :alt="alt" :width="width" :height="height">
</template>

<script>
    export default {
        name: "Screenshot",
        props: ["install", "filename", "alt", "width", "height"],
        data() {
            return {
                realSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNv1OCegAAAANSURBVBhXY2BgYEgBAABpAGW2L9BbAAAAAElFTkSuQmCC"
            }
        },
        mounted() {
            ddmm.install.getScreenshot(this.install, this.filename).then(uri => {
                this.realSrc = uri;
            });
        }
    }
</script>

<style scoped>

</style>