<template>
    <Dialog>
        <h2>{{_("renderer.modal_conflict_resolution.title")}}</h2>
        <br>
        <p>{{_("renderer.modal_conflict_resolution.description")}}</p>
        <br>
        <p><strong>{{_("renderer.modal_conflict_resolution.description_warning")}}</strong></p>
        <br>
        <div class="options">
            <div class="option">
                <p><i class="fas fa-laptop fa-3x"></i></p>
                <br>
                <p><strong>{{_("renderer.modal_conflict_resolution.label_local")}}</strong></p>
                <p>time and date</p>
                <br>
                <p><button class="primary">{{_("renderer.modal_conflict_resolution.button_local")}}</button></p>
            </div>
            <div class="option">
                <i class="fas fa-exchange-alt fa-3x"></i>
            </div>
            <div class="option">
                <p><i class="fas fa-cloud fa-3x"></i></p>
                <br>
                <p><strong>{{_("renderer.modal_conflict_resolution.label_cloud")}}</strong></p>
                <p>time and date</p>
                <br>
                <p><button class="primary">{{_("renderer.modal_conflict_resolution.button_cloud")}}</button></p>
            </div>
        </div>
        <br>
        <p class="other-buttons"><button class="primary">{{_("renderer.modal_conflict_resolution.button_cancel")}}</button></p>
    </Dialog>
</template>

<script>
    import Dialog from "../base/Dialog.vue";

    export default {
        name: "ConflictResolutionDialog",
        components: {Dialog},
        methods: {
            _: ddmm.translate
        }
    }
</script>

<style scoped>
    .options {
        display: flex;
    }

    .option {
        flex-basis: 33%;
        text-align: center;
    }

    .other-buttons {
        text-align: center;
    }
</style>