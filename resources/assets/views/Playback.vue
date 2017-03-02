<template>
    <div>
        Playback {{ urlData.params.id }} {{ urlData.params.terrain }}
    </div>
</template>

<script>
    import MainHeader from 'components/MainHeader.vue'
    import Container from 'components/Container.vue'

    export default {
        components: {
            MainHeader,
            Container
        },

        props: ['urlData'],

        mounted () {

            console.log('urlData', this.urlData)
        },

        computed: {
            unitName() {
                return this.$store.state.settings.unitName
            },

            title() {
                return this.unitName ? `${this.unitName} Mission List` : 'Mission List'
            },
        },

        watch: {
            unitName: function (name) {
                document.title = this.title
            }
        },

        methods: {

            fetchMissions () {

                axios.get('/missions')
                    .then(response => {

                        console.log('Got missions', response.data);
                        this.$store.commit('setMissionList', response.data)
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        }
    }
</script>
