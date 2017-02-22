<template>
    <div class="tab__container">
        <router-link v-for="item in tabs" :to="item.route">{{ item.text }}</router-link>
    </div>
</template>

<script>
    export default {
        props: ['tabs']
    }
</script>
