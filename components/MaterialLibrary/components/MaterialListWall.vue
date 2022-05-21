<template>
  <div>
    <template
      v-for="item in objList"
      :key="item.id"
    >
      <div v-if="item.node.type === WallType.Complicated" class="big_wall">
        <div class="preview">
          <img :src="item.url" />
        </div>
        <div class="wall_parts">
          <img
            :class="part.id === wallMaterialId ? 'itemChose' : 'item'"
            v-for="part in item.node.images.slice(0, 16)"
            :key="part.id"
            @click="setWallMaterial(part)"
            :src="part.url"
          />
          <div class="WallPreview">
            <img
              :class="part.id === wallMaterialId ? 'itemChose' : 'item'"
              v-for="part in item.node.images.slice(16)"
              :key="part.id"
              @click="setWallMaterial(part)"
              :src="part.url"
            />
          </div>
        </div>
      </div>

      <div v-if="item.node.type === WallType.Simple" class="small_wall">
        <div class="preview">
          <img :src="item.url" />
        </div>
        <div class="wall_parts">
          <img
            :class="part.id === wallMaterialId ? 'itemChose' : 'item'"
            v-for="part in item.node.images.slice(0, 16)"
            :key="part.id"
            @click="setWallMaterial(part)"
            :src="part.url"
          />
          <div class="WallPreview">
            <img
              :class="part.id === wallMaterialId ? 'itemChose' : 'item'"
              v-for="part in item.node.images.slice(16)"
              :key="part.id"
              @click="setWallMaterial(part)"
              :src="part.url"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { WallType } from '../../../const';

export default {
  props: {
    objList:{
        type: Array,
        default: () => []
    },
    selectedWallMaterial: {
      type: Object,
    },
    setWallMaterial: {
      type: Function,
    },
  },
  data() {
    return {
      WallType,
    };
  },
  computed: {
    wallMaterialId() {
      return this.selectedWallMaterial?.id;
    },
  },
  methods: {

  },
};
</script>

<style scoped lang="scss">
.big_wall {
  display: flex;
  width: 232px;
  height: 168px;
  background: #f5f5f5;
  border: 1px solid #f5f5f5;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 8px 8px 12px 8px;
  margin-bottom: 16px;
  .preview {
    display: flex;
    width: 104px;
    height: 148px;
    left: 8px;
    top: 8px;
    background: #e0e0e0;
    border-radius: 5px;
    padding: 4px 7px;
  }
  .wall_parts {
    display: flex;
    flex-wrap: wrap;
    font-size: 0;
    width: 104px;
    margin-left: 12px;
    .item {
      width: 16px;
      height: 16px;
      margin: 4px;
    }
  }
}
.small_wall {
  display: flex;
  background-color: rgb(247, 244, 248);
  border-radius: 5px;
  padding: 8px 8px 12px 8px;
  height: 50%;
  width: 232px;
  height: 112px;
  margin-bottom: 16px;
  .wall_parts {
    font-size: 0;
    width: 104px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 12px;
    .item {
      width: 16px;
      height: 16px;
      margin: 4px;
    }
  }
  .preview {
    padding: 8px 12px;
    display: flex;
    align-content: center;
    width: 104px;
    height: 96px;
    left: 8px;
    top: 8px;
    background: #e0e0e0;
    border-radius: 5px;
  }
}
.item:hover {
  outline: 2px solid #b9adff;
  transform: scale(2);
}
.itemChose {
  width: 18px;
  height: 18px;
  margin: 3px;
  border: 1px solid #ffffff;
  outline: 2px solid #8f7ef4;
}
.WallPreview {
  display: flex;
  flex-direction: column;
}
.material__list{
  padding: 0px !important;
}
</style>
