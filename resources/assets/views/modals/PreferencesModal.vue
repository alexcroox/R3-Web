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

            <p>

                <!--<input-select
                    :options="playbackSpeeds"
                    v-model="speed"
                    @changed="speedChange"
                    placeholder="Select speed"
                    class="margin__top--medium margin__bottom--medium">
                </input-select>-->
            </p>

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

    import bus from 'eventBus'
    import { ucfirst } from 'filters'
    import _find from 'lodash.find'
    import _each from 'lodash.foreach'

    export default {

        components: {
            Modal,
            InputSelect,
            FormButton,
            Feedback
        },

        data () {
            return {

                show: false,

                languages: this.formatLanguages(),

                locale: this.$locale.current(),

                speed: 30,

                playbackSpeeds: [5,10,30],
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

            languageChange (value) {

                this.$store.commit('setPreferenceLanguage', value)

                this.$locale.change(value)
            },

            speedChange (value) {


            },


            ucfirst,
        },

        computed: {

            missingStringsForCurrentLocale () {

                return (this.$store.state.settings.locales[this.locale].missingStringCount > 0)? this.$store.state.settings.locales[this.locale].missingStringCount : false
            },
        },

        mounted () {

            bus.$on('showPreferencesModal', () => {
                this.show = true
            })
        }
    }
</script>
