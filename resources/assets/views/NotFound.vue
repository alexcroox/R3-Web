<template>
    <div>
        <main-header :title="title"></main-header>

        <div class="not-found__container">
            <div class="not-found__content">
                <div class="not-found__title">PAGE NOT FOUND</div>
                <div class="not-found__sub-title">ERROR 404</div>
            </div>
        </div>
    </div>
</template>

<script>
    import MainHeader from 'components/MainHeader.vue'

    export default {
        components: {
            MainHeader
        },

        computed: {
            unitName() {
                return this.$store.state.settings.unitName
            },

            title() {
                return this.unitName ? `${this.unitName} - Page Not Found` : 'Page Not Found'
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

<style lang="stylus">
    @import '~styles/config/variables.styl'

    .not-found__container
        display flex
        justify-content center
        align-items center
        text-align center
        position absolute
        top $headerHeight
        left 0
        bottom 0
        right 0
        background url('~images/backgrounds/static.jpg') repeat top left

    .not-found__title
        background #000
        color #A4752C
        padding 5px 100px
        font-size 25px
        font-weight 700

    .not-found__sub-title
        background #000
        color #FFF
        padding 3px 130px
        margin-top 15px
        font-size 14px
        font-weight 700
        display inline-block

</style>
