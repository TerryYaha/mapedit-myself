<template>
    <div class="MaterialFrom">
        <div
            class="MaterialFrom-button"
            :class="{'MaterialFrom-button--active': source === MaterialSource.Official }"
            @click="changeSource(MaterialSource.Official)"
        >官方素材</div>
        <div
            class="MaterialFrom-button"
            :class="{'MaterialFrom-button--active': source === MaterialSource.Personal }"
            @click="changeSource(MaterialSource.Personal)"
        >个人素材</div>
    </div>
</template>

<script>
import { MaterialSource } from "../../../const";

export default{
    props: {
        source: {
            type: String,
        },
        onSourceChange: {
            type: Function,
        },
    },
    data() {
        return {
            MaterialSource,
        }
    },
    methods: {
        changeSource(source){
            this.onSourceChange(source);
        }
    },
}
</script>

<style scoped>
.MaterialFrom {
    width: 100%;
    height: 40px;
    background: #F5F5F5;
    border-radius: 6px;
    box-sizing: border-box;
    padding: 4px;
    display: flex;
    justify-content: space-between;
}
.MaterialFrom-button {
    width: 110px;
    height: 32px;
    background: transparent;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    color: #282C4A;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
.MaterialFrom-button--active {
    background: #8F7EF4;
    color: #F5F5F5;
}
</style>