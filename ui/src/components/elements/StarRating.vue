<template>
    <div class="rating" :title="rating + ' / 5'">
        <div v-for="_ in roundDown(rating)"><i class="fas fa-star fa-fw"></i></div>
        <div v-if="showHalf"><i class="fas fa-star-half-alt fa-fw"></i></div>
        <div v-for="_ in (showHalf?4:5)-roundDown(rating)"><i class="far fa-star fa-fw"></i></div>
    </div>
</template>

<script>
    export default {
        name: "StarRating",
        props: ["rating"],
        methods: {
            roundDown(number) {
                return Math.floor(number);
            }
        },
        data() {
            return {
                showHalf: this.roundDown(this.rating) < this.rating,
            }
        }
    }
</script>

<style scoped>
    .rating {
        display: inline-flex;
    }
</style>
