<template>
    <Dialog>
        <div style="text-align: center;">
            <br>
            <p><i class="fas fa-spinner fa-spin fa-2x"></i></p>
            <br>
            <h2>{{_("renderer.modal_unarchiving.title")}}</h2>
            <br>
            <p>{{_("renderer.modal_unarchiving.description")}}</p>
            <br>
        </div>
    </Dialog>
</template>

<script>
    import Dialog from "../base/Dialog";

    export default {
        name: "UnarchivingDialog",
        components: {Dialog},
        methods: {
            _: ddmm.translate,
        }
    }
</script>

<style scoped>

</style>
