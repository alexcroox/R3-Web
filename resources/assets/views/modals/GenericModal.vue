<template>
    <modal :show="show" @close="closeModal" width="normal">

        <span slot="header">
            <i :class="['fa', faIcon]" aria-hidden="true"></i>
            {{ title }}
        </span>

        <div slot="body">
            <slot></slot>
        </div>

    </modal>
</template>

<script>
    import Modal from 'components/Modal.vue'

    import bus from 'eventBus'
    import { ucfirst } from 'filters'

    export default {

        props: ['id', 'title', 'faIcon'],

        components: {
            Modal,
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

            bus.$on(`show${this.id}Modal`, () => {
                this.show = true
            })
        }
    }
</script>
