<template>
    <div>
        <h1>{{_("renderer.tab_downloads.downloads.title")}}</h1>

        <div v-if="downloads.length === 0" class="text-center">
            <br>
            <p>{{_("renderer.tab_downloads.downloads.message_none")}}</p>
        </div>

        <div class="mod" v-for="download in downloads" :key="download.filename">
            <div>
                <h3>{{download.filename}}</h3>
                <template v-if="download.total === 0">
                    <p>{{_("renderer.tab_downloads.downloads.status_text_downloading_uncertain",
                        bytesToMB(download.downloaded), downloadSpeed(download.downloaded, download.startTime))}}</p>
                    <br>
                    <div class="progress uncertain">
                        <div class="bar"></div>
                    </div>
                </template>
                <template v-else>
                    <p>{{_("renderer.tab_downloads.downloads.status_text_downloading", percentage(download.downloaded,
                        download.total), downloadSpeed(download.downloaded, download.startTime), eta(download.downloaded,
                        download.total, download.startTime))}}</p>
                    <br>
                    <div class="progress">
                        <div class="bar"
                             :style="{'width': percentage(download.downloaded, download.total) + '%'}"></div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "DownloadsSection",
        methods: {
            _: ddmm.translate,
            percentage(downloaded, total) {
                return Math.floor((downloaded / total) * 100) || 0;
            },
            downloadSpeed(downloaded, startTime) {
                const currentTime = Date.now();
                const dlDuration = Math.floor((currentTime - startTime) / 1000);
                const downloadedMB = downloaded / 1e6;
                const speedRaw = downloadedMB / dlDuration;
                return (Math.floor(speedRaw * 10) / 10) || 0;
            },
            bytesToMB(bytes) {
                return Math.floor(bytes / 1e5) / 10;
            },
            eta(downloaded, total, startTime) {
                const speed = this.downloadSpeed(downloaded, startTime) * 1e6;
                const remaining = total - downloaded;
                const seconds = remaining / speed;

                if (speed === 0) {
                    return "∞";
                }

                let timeStr = new Date(seconds * 1000).toISOString().substr(11, 8);
                if (seconds < 36e5) {
                    timeStr = timeStr.substr(3);
                }
                return timeStr;
            }
        },
        computed: {
            downloads() {
                return this.$store.state.downloads;
            }
        }
    }
</script>

<style scoped>

</style>
