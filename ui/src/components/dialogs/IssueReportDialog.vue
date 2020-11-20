<template>
    <Dialog>
        <h2>{{_("renderer.modal_issue_report.title")}}</h2>
        <br>
        <p>{{_("renderer.modal_issue_report.description")}}</p>
        <br>
        <label for="issue_report_type">{{_("renderer.modal_issue_report.label_type")}}</label>
        <p><select id="issue_report_type" v-model="type">
            <option value="bug">{{_("renderer.modal_issue_report.option_bug")}}</option>
            <option value="broken mod">{{_("renderer.modal_issue_report.option_broken_mod")}}</option>
        </select></p>
        <template v-if="type === 'broken mod'">
            <br>
            <label for="issue_report_mod">{{_("renderer.modal_issue_report.label_mod")}}</label>
            <p><input type="text" id="issue_report_mod" v-model="mod" :placeholder="_('renderer.modal_issue_report.placeholder_mod')"></p>
        </template>
        <br>
        <label for="issue_report_body">{{_("renderer.modal_issue_report.label_body")}}</label>
        <p><textarea style="resize: none;"
                     id="issue_report_body"
                     rows="5"
                     :placeholder="_('renderer.modal_issue_report.placeholder_body')"
                     v-model="body"></textarea></p>
        <br>
        <p>
            <button class="primary" :disabled="sending" @click="sendAndClose">
                <i class="fas fa-paper-plane fa-fw"></i>
                {{_("renderer.modal_issue_report.button_submit")}}
            </button>
            <button class="secondary" @click="close"><i class="fas fa-times fa-fw"></i> {{_("renderer.modal_issue_report.button_cancel")}}</button>
        </p>
    </Dialog>
</template>

<script>

    import Dialog from "./base/Dialog";
    import Link from "../elements/Link";

    export default {
        name: "IssueReportDialog",
        components: {Link, Dialog},
        data() {
            return {
                type: "bug",
                body: "",
                mod: "",
                sending: false
            }
        },
        methods: {
            _: ddmm.translate,
            close() {
                this.$store.commit("hide_modal", {modal: "issue_report"});
            },
            sendAndClose() {
                this.sending = true;
                fetch("https://ddmm-issues.shinomiya.group/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: this.type,
                        body: this.body,
                        mod: this.type === "broken mod" ? this.mod : null
                    })
                }).then(() => {
                    this.sending = false;
                    this.close();
                });
            }
        }
    }
</script>

<style scoped>

</style>
