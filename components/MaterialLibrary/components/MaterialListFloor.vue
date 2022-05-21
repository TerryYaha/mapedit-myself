<template>
  <div class="MaterialListObJ">
    <div
      class="MaterialListItem"
      v-for="item in objList"
      :key="item.id"
      :class="item.id === floorMaterialId ? 'checked' : ''"
      @click="setFloorMaterial(item)"
    >
      <img class="img" :src="item.url" alt="" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    objList:{
        type: Array,
        default: () => []
    },
    selectedFloorMaterial: {
      type: Object,
    },
    setFloorMaterial: {
      type: Function,
    },
  },
  computed: {
    floorMaterialId() {
      return this.selectedFloorMaterial?.id;
    },
  },
};
</script>

<style scoped lang="scss">
.MaterialListObJ {
  display: flex;
  justify-content: flex-start;
  align-items:center;
  flex-wrap: wrap;
  .MaterialListItem {
    width: 64px;
    height: 64px;
    border: 2px solid #f5f5f5;
    margin-bottom: 16px;
    margin-right: 16px;
    cursor: pointer;
    .img {
      display: block;
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
  }
  .MaterialListItem:nth-of-type(3n+0){margin-right: 0;} 
  .checked{
    outline: 2px solid #8F7EF4;
  }
  .MaterialListItem:not(.checked):hover {
    outline: 2px solid #B9ADFF;
  }
}
</style>
