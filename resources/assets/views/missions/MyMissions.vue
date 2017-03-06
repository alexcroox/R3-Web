<template>
    <div>

        <container v-if="!playerId" box="true" class="align__text--center margin__top--huge">

            <i class="fa fa-user-circle-o my-missions__icon" aria-hidden="true"></i>

            <!-- // TODO: locale -->
            <h3 class="margin__bottom--medium">
                Enter your
                <a :href="playerIdGif" class="text-link text-link--with-underline" target="_blank">
                    {{ $t('arma-player-id') }}
                </a>
                to filter your missions
            </h3>

            <p class="margin__bottom--large">
                {{ $t('events-effect-you') }}
            </p>

            <input-text
                v-model="newPlayerId"
                :placeholder="$t('arma-player-id')"
                short="true"
                name="my-player-id"
                class="margin__right--small">
            </input-text>

            <form-button @click="savePlayerId" :loading="savingPlayerId">{{ saveButtonText }}</form-button>

        </container>

        <container v-else>

            <list-search
                :title="ucfirst($t('missions'))"
                :finishedLoading="noPlayerMissions"
                :listTotal="listData.length"
                @searched="updateSearchQuery($event)"
                :placeholder="$t('search-missions')">
            </list-search>

            <table-list-missions
                :data="listData"
                :columns="listColumns"
                :filter-key="searchQuery"
                :noData="noPlayerMissions">
            </table-list-missions>

        </container>

        <container v-if="playerId">
            <button @click="resetPlayerId" class="text-link text-link--with-icon margin__top--large">
                <i class="fa fa-user-circle-o" aria-hidden="true"></i>
                Change player ID
            </button>
        </container>

    </div>
</template>

<script>
    import ListSearch from 'components/ListSearch.vue'
    import Container from 'components/Container.vue'
    import TableListMissions from 'components/TableListMissions.vue'
    import InputText from 'components/InputText.vue'
    import FormButton from 'components/FormButton.vue'

    import playerIdGif from 'images/player-id.gif'

    import _each from 'lodash.foreach'
    import { ucfirst } from 'filters'

    export default {
        components: {
            Container,
            ListSearch,
            TableListMissions,
            InputText,
            FormButton
        },

        data () {
            return {

                searchQuery: '',
                savingPlayerId: false,
                saveButtonText: 'Save',
                newPlayerId: 0,
                noPlayerMissions: false,
                playerId: this.$cookie.get('player-id'),
                listColumns: ['mission', 'terrain', 'length', 'players', 'played'],
                playerIdGif,
            }
        },

        methods: {

            updateSearchQuery (val) {

                this.searchQuery = val
            },

            resetPlayerId () {

                this.savingPlayerId = false
                this.playerId = 0
                this.$cookie.delete('player-id')
                this.saveButtonText = 'Save'
            },

            savePlayerId () {

                this.savingPlayerId = true
                this.saveButtonText = 'Saving'
                console.log('Saving player id', this.newPlayerId)

                // Save player ID for 3 years
                this.$cookie.set('player-id', this.newPlayerId, { expires: '3Y' });
                this.playerId = this.newPlayerId
            },

            ucfirst,
        },

        computed: {

            listData () {

                let missionData = []

                if(this.$store.state.missions) {

                    _each(this.$store.state.missions, (item) => {

                        let itemData = item;

                        // We only want missions that this player was a part of
                        if (this.playerId.indexOf(item.player_list) > -1) {

                            itemData.mission = item.display_name
                            itemData.length = item.length_human
                            itemData.players = item.player_count
                            itemData.played = item.played_human

                            missionData.push(itemData)
                        }
                    });

                    if (!missionData.length)
                        this.noPlayerMissions = true

                    console.log('missionData', missionData)
                }

                return missionData
            },
        },
    }
</script>

<style lang="stylus">
    .my-missions__icon
        font-size  70px
        color  #6ab73b
        margin-bottom 30px
</style>
