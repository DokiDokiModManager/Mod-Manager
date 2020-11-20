<template>
    <div>
        <h1>{{_("renderer.tab_downloads.store.title_ddmc")}}</h1>
        <p>{{_("renderer.tab_downloads.store.description_ddmc")}} <Link to="https://www.dokidokimodclub.com/">{{_("renderer.tab_downloads.store.link_ddmc")}}</Link></p>
        <br>
        <p>{{_("renderer.tab_downloads.store.description_featured")}}</p>

        <template v-if="!loaded">
            <br>
            <p><i class="fas fa-spinner fa-spin"></i> {{_("renderer.tab_downloads.store.text_loading")}}</p>
        </template>

        <template v-else-if="error">
            <br>
            <p><i class="fas fa-exclamation-triangle"></i> {{_("renderer.tab_downloads.store.error_loading")}}</p>
        </template>

        <template v-else>

            <br>

            <p><input type="text" v-model="search" :placeholder="_('renderer.tab_downloads.store.placeholder_search')"
                      @keyup="searchEscapeHandler" @click="search = ''">
            </p>

            <br>

            <div v-for="mod in modList" :class="{'mod': true, 'highlighted-mod': mod.highlighted}" @click="viewMod(mod)" style="cursor: pointer;">
                <div class="image">
                    <img alt="" :src="mod.icon" width="75" v-if="mod.icon">
                    <img alt="" src="../../../images/logo.png" width="75" v-else>
                </div>
                <div>
                    <h3><strong>{{mod.name}} <span v-if="mod.nsfw" class="tag">18+</span></strong></h3>
                    <StarRating :rating="mod.rating"></StarRating>
                    <p>{{mod.shortDescription}}</p>
                    <p v-if="debug">{{mod.downloadURL}}</p>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    import DDLCModClub from "../../../js/stores/DDLCModClub";
    import Logger from "../../../js/utils/Logger";

    import Fuse from "fuse.js";
    import StarRating from "../../elements/StarRating";
    import Link from "../../elements/Link";

    export default {
        name: "StoreSection",
        components: {StarRating, Link},
        data() {
            return {
                modStore: new DDLCModClub(),
                loaded: false,
                error: false,
                fuse: null,
                search: "",
                mods: [],
                debug: !!ddmm.env.DDMM_DEVELOPER
            }
        },
        methods: {
            _: ddmm.translate,
            viewMod(mod) {
                this.$store.commit("preview_mod", mod);
            },
            searchEscapeHandler(e) {
                if (e.key === "Escape") {
                    this.search = "";
                }
            }
        },
        computed: {
            modList() {
                if (!this.search) return this.mods;
                return this.fuse.search(this.search).map(r => r.item);
            }
        },
        mounted() {
            this.modStore.getListing(0).then(listing => {
                this.mods = listing.mods;
                this.loaded = true;
                this.fuse = new Fuse(this.mods, {
                    keys: ["name", "description", "shortDescription"]
                });
            }).catch(err => {
                Logger.error("Mod Store", err.toString());
                this.loaded = true;
                this.error = true;
            });
        }
    }
</script>

<style scoped>

</style>
