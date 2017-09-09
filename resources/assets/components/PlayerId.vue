<template>
    <div>
        <container v-if="playerId && !forceChange">
            <button @click="resetPlayerId" class="text-link text-link--with-icon margin__top--large">
                <i class="fa fa-user-circle-o" aria-hidden="true"></i>
                {{ $t('change-player-id') }}
            </button>
        </container>

        <container v-if="!playerId || forceChange"  box="true" class="align__text--center margin__top--huge container--no-player-id">

            <i class="fa fa-user-circle-o my-missions__icon" aria-hidden="true"></i>

            <!-- // TODO: locale -->
            <h3 class="margin__bottom--medium" v-html="$t('enter-filter-missions',
                {
                    'url': playerIdGif,
                    'class': 'text-link text-link--with-underline',
                    'target': '_blank'
                })">
            </h3>

            <p class="margin__bottom--large">
                {{ $t('events-effect-you') }}
            </p>

            <input-text
                v-model="newPlayerId"
                @enter="savePlayerId"
                :placeholder="$t('arma-player-id')"
                short="true"
                name="my-player-id"
                class="margin__right--small">
            </input-text>

            <form-button @click="savePlayerId" :loading="savingPlayerId">{{ saveButtonText }}</form-button>

        </container>
    </div>
</template>

<script>
    import { ucfirst } from 'filters'
    import { mapGetters } from 'vuex'

    import Container from 'components/Container.vue'
    import InputText from 'components/InputText.vue'
    import FormButton from 'components/FormButton.vue'

    import playerIdGif from 'images/player-id.gif'

    export default {
        props: [],

        data () {
            return {
                forceChange: false,
                savingPlayerId: false,
                saveButtonText: ucfirst(this.$t('save')),
                newPlayerId: this.$store.state.preference.playerId,
                playerIdGif,
            }
        },

        components: {
            InputText,
            Container,
            FormButton,
        },

        computed: {

            ...mapGetters([
                'playerId',
            ]),
        },

        methods: {

            resetPlayerId () {

                this.savingPlayerId = false
                this.forceChange = true
                this.saveButtonText = ucfirst(this.$t('save'))

                // We need to tell the parent we need to show the parent and to hide
                // anything else
                this.$emit('changePlayerId', this.forceChange)
            },

            savePlayerId () {

                this.savingPlayerId = true
                this.saveButtonText = ucfirst(this.$t('saving'))

                // Save player ID to localstorage
                this.$store.commit('setPreferencePlayerId', this.newPlayerId)
                this.playerId = this.newPlayerId
                this.forceChange = false

                // We need to tell the parent we are done showing the dialog
                this.$emit('changePlayerId', this.forceChange)

                this.$toastr.success('Your player ID has been saved')
            },

            ucfirst,
        },
    }
</script>

<style lang="stylus">
    .container--no-player-id
        @media (max-width 600px)
            text-align left !important

    .my-missions__icon
        font-size 70px
        color #6ab73b
        margin-bottom 30px

        @media (max-width 600px)
            display none
</style>
