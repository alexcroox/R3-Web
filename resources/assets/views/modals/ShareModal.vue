<template>
    <modal :show="show" @close="closeModal" width="normal">

        <span slot="header">
            <i class="fa fa-share-alt" aria-hidden="true"></i>
            {{ ucfirst($t('playback-share-link')) }}
        </span>

        <div slot="body">

            <p>
                {{ ucfirst($t('playback-share-intro')) }}
            </p>

            <input-text
                icon="link"
                v-model="link"
                :lightBackground="true"
                :full="true"
                @focussed="focusShareInput($event)"
                class="margin__top--large">
            </input-text>

        </div>

    </modal>
</template>

<script>
    import 'styles/components/margin.styl'

    import Modal from 'components/Modal.vue'
    import InputText from 'components/InputText.vue'

    import bus from 'eventBus'
    import { ucfirst } from 'filters'

    export default {

        props: ['link'],

        components: {
            Modal,
            InputText,
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

            focusShareInput (test) {

                console.warn(test)

                this.$refs.url.select()
            },

            ucfirst
        },

        mounted () {

            bus.$on('showShareModal', () => {
                this.show = true
            })
        }
    }
</script>
