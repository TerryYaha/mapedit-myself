<template>
    <div class="MaterialType">
        <div class="type-item" :class="{'type--active': selectedMode === 'floors' }" @click="changeMode('floors')">
            <IconFont type="icon-floor" class="type-item-icon" /> 
            <div class="type-item-theme">地板</div>
            <div class="type-item-bg" v-if="selectedMode === 'floors'"></div>
        </div>
        <div class="type-item" :class="{'type--active': selectedMode === 'walls' }" @click="changeMode('walls')">
            <IconFont type="icon-wall" class="type-item-icon" /> 
            <div class="type-item-theme">墙壁</div>
            <div class="type-item-bg" v-if="selectedMode === 'walls'"></div>
        </div>
        <div class="type-item" :class="{'type--active': selectedMode === 'objects' }" @click="changeMode('objects')">
            <IconFont type="icon-objects" class="type-item-icon" /> 
            <div class="type-item-theme">物件</div>
            <div class="type-item-bg" v-if="selectedMode === 'objects'"></div>
        </div>
        <div class="type-item" :class="{'type--active': selectedMode === 'stickers' }" @click="changeMode('stickers')">
            <IconFont type="a-icon-picture" class="type-item-icon" />
            
            <div class="type-item-theme">贴图</div>
            <div class="type-item-bg" v-if="selectedMode === 'stickers'"></div>
        </div>
        <div class="type-item-line">
            <div class="line-white"></div>
        </div>
        <div class="type-item" :class="{'type--active': selectedMode === 'tileEffects' }" @click="changeMode('tileEffects')">
            <IconFont type="a-icon-effects" class="type-item-icon" />
            <div class="type-item-theme">添加效果</div>
            <div class="type-item-bg" v-if="selectedMode === 'tileEffects'"></div>
        </div>
    </div>
</template>

<script>
import IconFont from "../../iconFont";

export default {
    components: {
        IconFont,
    },
    props: {
        selectedMode: {
            type:String,
            default:''
        },
        changeMode: {
            type:Function
        },
    },
    data() {
        return {
            
        }
    },
    methods: {
        
    },
}
</script>

<style lang="scss" scoped>
.MaterialType{
    height: 100%;
    width: 64px;
    background: #282C4A;
    z-index: 1;
    overflow: hidden;
    .type-item {
        display:flex;
        justify-content:center;
        align-items:center;
        width:64px;
        height:64px;
        background: #282C4A;   
        border-radius: 0px 8px 8px 0px;
        flex-direction: column;
        color: #E0E0E0;
        position: relative;
        z-index: 2;
        cursor: pointer;
        .type-item-icon{
            font-size: 24px;
            height: 30px;
        }
        .type-item-theme {
            font-size: 12px;
            font-weight: bold;
        }
        .type-item-bg {
            background: #fff;
            width: 100%;
            height: 80px;
            position: absolute;
            z-index: -1;
        }
    }
    .type-item-line {
        display:flex;
        justify-content:center;
        align-items:center;
        width:64px;
        height:17px;
        background: #282C4A;   
        border-radius: 0px 8px 8px 0px;
        flex-direction: column;
        position: relative;
        z-index: 2;
        .line-white {
            width:32px;
            height:1px;
            background: #E0E0E0;
    
        }
    }
    .type--active {
        z-index: 1;
        color: #282C4A;
    }
    .type-item:not(.type--active):hover {
        color: #fff;
    }
}
</style>