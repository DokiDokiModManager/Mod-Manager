<template>
    <div class="drop-zone" ref="zone">
        <p><i class="fas fa-upload fa-2x"></i></p>
        <p class="text">{{text}}</p>
    </div>
</template>

<script>
    import Logger from "../../js/utils/Logger";

    export default {
        name: "DropZone",
        props: ["text"],
        mounted() {
            Logger.info("Drop Zone", "Drop zone activated!");
            const zone = this.$refs.zone;

            zone.addEventListener("drop", this._ondrop);
            zone.addEventListener("dragover", this._ondragover);
        },
        beforeDestroy() {
            const zone = this.$refs.zone;

            zone.removeEventListener("drop", this._ondrop);
            zone.removeEventListener("dragover", this._ondragover);
        },
        methods: {
            _ondrop(event) {
                event.preventDefault();
                Logger.info("Drop Zone", "Item dropped!");
                for (let i = 0; i < event.dataTransfer.items.length; i++) {
                    const item = event.dataTransfer.items[i];

                    if (item.kind === "file") {
                        const entry = item.webkitGetAsEntry();

                        if (entry.isDirectory) {
                            this.$emit("directory", entry);
                        } else if (entry.isFile) {
                            this.$emit("file", item.getAsFile());
                        }
                    }
                }
            },
            _ondragover(event) {
                event.preventDefault();
            }
        }
    }
</script>

<style scoped>
    .drop-zone {
        border: 5px dashed rgba(255, 255, 255, 0.5);
        padding: 2em 1em;
        cursor: pointer;
        text-align: center;
        border-radius: 10px;
    }

    .drop-zone.active {
        border-color: #fff;
    }
</style>
