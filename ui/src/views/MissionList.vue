<template>
    <div>
        <main-header></main-header>
        Mission list
    </div>
</template>

<script>
    import MainHeader from '../components/MainHeader.vue'

    export default {
        components: {
            MainHeader
        },
        mounted() {
            console.log('Mission list mounted')
            document.title = 'Mission List'
        }
    }
</script>
