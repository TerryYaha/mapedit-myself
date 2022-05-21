<template>
    <div class="overlay-bg">
        <slot @click.native.stop></slot>
    </div>
</template>

<script>
export default {
    emit:['click'],
}
</script>

<style scoped>
.overlay-bg{
    position:fixed;
    top:0;
    background: rgba(40, 44, 74, 0.3);
    width:100%;
    height:100%;
    z-index:1000;
    justify-content: center;
    align-items: center;
    display: flex;
}
</style>