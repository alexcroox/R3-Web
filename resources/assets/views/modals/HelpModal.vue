<template>
    <modal :show="show" @close="closeModal" width="normal">

        <span slot="header">
            <i class="fa fa-question-circle" aria-hidden="true"></i>
            {{ ucfirst($t('help')) }}
        </span>

        <div slot="body">

            <h3>{{ $t('terrain-missing') }}</h3>

            <p class="margin__top--small">
                {{ $t('automated-tiler') }}
                <br><br>
                <span v-html="$t('automated-tiler-instructions',
                {
                    'url': 'https://github.com/alexcroox/R3-Web/wiki/Adding-new-terrains',
                    'class': 'text-link text-link--with-underline',
                    'target': '_blank'
                })">
                </span>
            </p>

            <h3 class="margin__top--large">{{ $t('vehicle-wrong-icon') }}</h3>

            <p class="margin__top--small">
                {{ $t('automated-icons') }}
                <br><br>
                <span v-html="$t('vehicle-wrong-icon-instructions',
                {
                    'url': 'https://github.com/alexcroox/R3-Web/wiki/Adding-new-icons',
                    'class': 'text-link text-link--with-underline',
                    'target': '_blank'
                })">
                </span>
            </p>

            <h3 class="margin__top--large">{{ $t('any-other-issues') }}</h3>

            <p class="margin__top--small">
                <span v-html="$t('file-issue',
                {
                    'url': 'https://github.com/alexcroox/R3-Web',
                    'class': 'text-link text-link--with-underline',
                    'target': '_blank'
                })">
                </span>
                <br><br>
                <span v-html="$t('chat-developer',
                {
                    'url': 'https://slackin.ace3mod.com/',
                    'class': 'text-link text-link--with-underline',
                    'target': '_blank'
                })">
                </span>
            </p>
        </div>

    </modal>
</template>

<script>
    import 'font-awesome/css/font-awesome.css'
    import 'styles/components/margin.styl'
    import 'styles/components/text-link.styl'

    import Modal from 'components/Modal.vue'
    import bus from 'eventBus'
    import { ucfirst } from 'filters'

    export default {

        components: {
            Modal
        },

        data () {
            return {
                show: false
            }
        },

        methods: {
            closeModal () {
                this.show = false
            },
            ucfirst
        },

        mounted () {
            bus.$on('showHelpModal', () => {
                this.show = true
            })
        }
    }
</script>
