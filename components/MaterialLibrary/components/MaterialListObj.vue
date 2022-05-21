<template>
  <div class="MaterialListObJ">
    <div
      class="MaterialListItem"
      v-for="item in objList"
      :key="item.id"
      :class="item.id === objectMaterialId ? 'checked' : ''"
      @click="setObjectMaterial(item)"
    >
      <img class="img" :src="item.url" alt="" />
      <div>
        <el-tooltip
          v-if="item.name.length > 5"
          :content="item.name"
          placement="top"
        >
          <div class="obj-title">
            <span>{{ formatName(item.name) }}</span>
          </div>
        </el-tooltip>
        <div v-else>
          <div class="obj-title">
            <span>{{ formatName(item.name) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    objList: {
      type: Array,
      default: () => [],
    },
    selectedObjectMaterial: {
      type: Object,
    },
    setObjectMaterial: {
      type: Function,
    },
  },
  computed: {
    objectMaterialId() {
      return this.selectedObjectMaterial?.id;
    },
  },
  methods: {
    formatName(name) {
      if (name.length > 5) {
        return name ? name.slice(0, 4) + "..." : "";
      } else {
        return name ? name.slice(0, 4) : "";
      }
    },
  },
};
</script>

<style scoped lang="scss">
.MaterialListObJ {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  .MaterialListItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: #f5f5f5;
    width: 72px;
    height: 100px;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    margin-right: 8px;
    cursor: pointer;
    .img {
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
    .obj-title {
      font-size: 12px;
      color: #282c4a;
    }
  }
  .MaterialListItem:nth-of-type(3n + 0) {
    margin-right: 0;
  }
  .checked {
    outline: 2px solid #8f7ef4;
  }
  .MaterialListItem:not(.checked):hover {
    outline: 2px solid #b9adff;
  }
}
</style>

