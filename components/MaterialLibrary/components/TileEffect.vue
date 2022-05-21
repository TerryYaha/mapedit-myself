<template>
  <div
    class="MaterialList-item"
    :class="{'tileEffect-checked': checked, 'tileEffect-disabled': disabled }"
    @click="onClick(tileEffect)"
>
    <div class="MaterialList-tileEffect-button">
        <img class="MaterialList-tileEffect-img" :src="tileEffect.url">
        <div class="MaterialList-tileEffect-ctx">
            <div class="tileEffect-ctx-title">{{ tileEffect.name }}</div>
            <div class="tileEffect-ctx-text">{{ tileEffect.describe }}</div>
        </div>
    </div>
    <div class="tileEffect-ctx-pre">{{ tileEffect.tip }}</div>
  </div>
</template>

<script>
export default {
  props: {
    tileEffect: {
      type: Object,
    },
    checked: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    onClick: {
      type: Function,
    },
  },
};
</script>

<style lang="scss" scoped>
.MaterialList-item {
    margin-top: 16px;
    width: 100%;
    height: 120px;
    border-radius: 4px;
    outline: 1px solid #E0E0E0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .MaterialList-tileEffect-button{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 80px;
        .MaterialList-tileEffect-img{
        width: 40px;
        height: 40px;
    }
    .MaterialList-tileEffect-ctx{
        width: 137px;
        margin-left: 20px;
        text-align: start;
        .tileEffect-ctx-title{
            font-size: 12px;
            font-weight: bold;
            color: #282C4A;
            line-height: 20px;
        }
        .tileEffect-ctx-text{
            margin-top: 4px;
            font-size: 12px;
            font-weight: 400;
            color: #282C4A;
            line-height: 20px;
        }
    }
    }
    
    .tileEffect-ctx-pre{
        width: 192px;
        height: 32px;
        background: #F5F5F5;
        border-radius: 3px 3px 3px 3px;
        opacity: 1;
        font-size: 12px;
        font-weight: 400;
        color: #282C4A;
        text-align: start;
        padding-left: 8px;
        display: flex;
        align-items: center;
        position: relative;
        top: -10px;

    }
}
.tileEffect-checked:not(.tileEffect-disabled) {
    outline: 2px solid #8F7EF4;
}

.tileEffect-disabled {
    cursor: not-allowed;
    opacity: 0.4;
}
</style>
