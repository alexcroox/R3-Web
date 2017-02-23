<template>
    <modal :show="show" @close="closeModal">
        <h1>
            <i class="fa fa-question-circle" aria-hidden="true"></i>
            R3 help
        </h1>

        <h3 class="margin__top--large">A terrain is missing</h3>
        <p>
            R3 has an automated tiler which allows you to add new terrains that every user of R3 across all unit websites will immediately and automatically benefit from.
            <br><br>
            Follow <a href="https://github.com/alexcroox/R3-Web/wiki/Adding-new-terrains" class="text-link text-link--with-underline" target="_blank">instructions here</a> to add support for a new terrain.
        </p>

        <h3 class="margin__top--large">A vehicle has the wrong icon</h3>
        <p>
            R3 has an automated vehicle icon colourizer which allows you to upload new vehicle icons that every user of R3 across all unit websites will immediately and automatically benefit from.
            <br><br>
            Follow <a href="https://github.com/alexcroox/R3-Web/wiki/Adding-new-icons" class="text-link text-link--with-underline" target="_blank">instructions here</a> to add new vehicle icons.
        </p>

        <h3 class="margin__top--large">Any other issues</h3>
        <p>
            Please file an issue on the <a href="https://github.com/alexcroox/R3-Web" class="text-link text-link--with-underline" target="_blank">R3 GitHub</a>
            <br><br>
            If you'd prefer to chat to the developer look for Titan in the <a href="https://slackin.ace3mod.com/" class="text-link text-link--with-underline" target="_blank">ACE3 Slack</a>
        </p>
    </modal>
</template>

<script>
    import 'font-awesome/css/font-awesome.css'
    import 'styles/components/margin.styl'
    import 'styles/components/text-link.styl'

    import Modal from 'components/Modal.vue'
    import bus from 'eventBus'

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
            }
        },

        mounted () {
            bus.$on('showHelpModal', () => {
                this.show = true
            })
        }
    }
</script>
