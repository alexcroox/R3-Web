<template>
    <div>
        My Missions
    </div>
</template>

<script>
    import MainHeader from '../components/MainHeader.vue'

    export default {
        components: {
            MainHeader
        },
        mounted() {
            console.log('My missions mounted')
            document.title = 'My missions'
        }
    }
</script>
