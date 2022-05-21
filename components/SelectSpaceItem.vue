<template>
  <div class="select-space-item" v-for="space in spaceList" :key="space.id">
    <div
      class="space-box"
      :class="{
        'space-checked': space.id === currentSpace,
        'space-disabled': disabled,
      }"
      @click="selectedSpace(space)"
    >
      <div class="space-img">
        <img :src="space.images[0]" alt="" />
      </div>
      <span class="space-name">{{ space.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
    },
    spaceList: {
      type: Array,
      default: () => [],
    },
    selectedSpaceTransfer: Object,
    setSpaceTransfer: Function,
  },
  data(){
      return {
          currentSpace:null,
      }
  },
  methods:{
      selectedSpace(space){
          this.currentSpace = space.id;
          this.setSpaceTransfer(space);
      }
  }
};
</script>

<style lang="scss" scoped>
.select-space-item {
  margin-top: 16px;
  width: 100%;
  height: 72px;
  .space-box {
    height: 100%;
    border-radius: 4px;
    display: flex;
    background: #f5f5f5;
    justify-content: flex-start;
    align-items: center;
    .space-img {
      width: 88px;
      height: 56px;
      border-radius: 3px;
      margin-left: 8px;
      overflow: hidden;
      border: 1px solid #dddddd;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .space-name {
      margin-left: 8px;
      /* small regular */

      font-family: "Noto Sans CJK";
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      /* or 24px */

      display: flex;
      align-items: center;

      /* bg dark */

      color: #282c4a;
    }
    &:hover{
        outline: 2px solid #8f7ef4;
    }
  }

  .space-checked:not(.space-disabled) {
    outline: 2px solid #8f7ef4;
  }

  .space-disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}
</style>
