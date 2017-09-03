<template>
    <modal :show="show" @close="closeModal">

        <span slot="header">
            <i class="fa fa-cog" aria-hidden="true"></i>
            {{ ucfirst($t('preferences')) }}
        </span>

        <div slot="body">

            <p>{{ $t('customise-r3-experience') }}</p>

            <h3 class="margin__top--large">{{ ucfirst($t('playback-speed')) }}</h3>

            <p class="margin__top--small">{{ $t('playback-speed-explain') }}</p>

            <speed-slider
                class="margin__top--medium speed-slider__container--half-width speed-slider__container--alt"
                :speed="speed"
                @change="speedChange">
            </speed-slider>

            <h3 class="margin__top--large">{{ ucfirst($t('language')) }}</h3>

            <p>
                <input-select
                    :options="languages"
                    v-model="locale"
                    @changed="languageChange"
                    placeholder="Select language"
                    class="margin__top--medium margin__bottom--medium">
                </input-select>
            </p>

            <feedback
                v-if="missingStringsForCurrentLocale"
                type="information"
                class="margin__top--medium margin__bottom--medium">
                <span slot="message" v-html="$t('missing-strings', { numMissing: missingStringsForCurrentLocale })"></span>
            </feedback>

            <p v-html="$t('contribute-translations',
                {
                    'url': 'https://github.com/alexcroox/R3-Web/wiki',
                    'class': 'text-link text-link--with-underline',
                    'target': '_blank'
                })">
            </p>
        </div>

    </modal>
</template>

<script>
    import 'styles/components/margin.styl'
    import 'styles/components/text-link.styl'

    import Modal from 'components/Modal.vue'
    import InputSelect from 'components/InputSelect.vue'
    import FormButton from 'components/FormButton.vue'
    import Feedback from 'components/Feedback.vue'
    import SpeedSlider from 'components/SpeedSlider.vue'

    import bus from 'eventBus'
    import { ucfirst } from 'filters'
    import _find from 'lodash.find'
    import _each from 'lodash.foreach'

    export default {

        components: {
            Modal,
            InputSelect,
            FormButton,
            Feedback,
            SpeedSlider
        },

        data () {
            return {
                show: false,
                languages: this.formatLanguages(),
                speed: this.$store.state.preference.playbackSpeed || 10,
            }
        },

        methods: {

            closeModal () {
                this.show = false
            },

            formatLanguages () {

                let langs = []

                _each(this.$store.state.settings.locales, (localeData, locale) => {

                    langs.push({
                        "value": locale,
                        "label": localeData.display
                    })
                })

                return langs
            },

            languageChange (option) {

                this.$store.commit('setPreferenceLanguage', option)

                this.$locale.change(option.value)
            },

            speedChange (value) {

                this.$store.commit('setPreferencePlaybackSpeed', value)
            },


            ucfirst,
        },

        computed: {

            missingStringsForCurrentLocale () {

                return (this.$store.state.settings.locales[this.locale.value].missingStringCount > 0)? this.$store.state.settings.locales[this.locale.value].missingStringCount : false
            },

            locale () {
                return this.$store.state.preference.locale
            },
        },

        mounted () {

            bus.$on('showPreferencesModal', () => {
                this.show = true
            })
        }
    }
</script>
