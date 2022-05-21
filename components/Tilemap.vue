<template>
  <div class="overflow-y-auto h-full text-left">
    <div class="w-full p-2">
      <div class="p-2">
        <div class="preview">
          <p class="title">{{ tilemap.name }}</p>
          <div v-if="ifHasDirection" class="previewDisplay">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="向左旋转"
              placement="top"
            >
              <Icon
                iconType="a-icon-rotateleft"
                class="direction-icon"
                style="transform: rotate(-24deg)"
                @click="turnLeftImg"
              ></Icon>
            </el-tooltip>
            <div>
              <img
                :src="
                  directionImg[currentIndex] && directionImg[currentIndex].url
                "
                alt=""
              />
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="向右旋转"
              placement="top"
            >
              <Icon
                iconType="a-icon-rotateright"
                class="direction-icon"
                style="transform: rotate(24deg)"
                @click="turnRightImg"
              ></Icon>
            </el-tooltip>
          </div>
          <div v-else class="previewDisplay">
            <div>
              <img :src="tilemap.imageURL" alt="" />
            </div>
          </div>
        </div>
        <div class="propertyFunction">
          <p class="title">素材属性</p>
          <div>
            <div class="mt-4 flex justify-between">
              <span>遮挡人物</span>
              <el-checkbox
                :modelValue="tilemap.isMaskPlayer"
                @change="handleIsMaskPlayerChange"
                size="large"
                :disabled="ifCollider"
              />
            </div>
            <div class="mt-4 flex justify-between">
              <span>人物不可通过</span>
              <el-checkbox
                :modelValue="tilemap.isCollider"
                @change="handleIsColliderChange"
                size="large"
                :disabled="ifMaskPlayer"
              />
            </div>
          </div>
        </div>
        <Interactive
          class="propertyInteractive"
          :interactive="interactive"
          :key="tilemap.id"
          :canAddInteractive="canAddInteractive"
          :isOnline="isOnline"
          @change="interactiveChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { INTERACTIVE_TYPE, INTERACTIVE_TYPE_LABEL, CELL_WIDTH, CELL_HEIGHT } from "../const";
import { getNameFromImageURL } from '../util';
import Message from "./base/toast";
import { OnClickOutside } from "@vueuse/components";
import Interactive from "./Interact/InteractIndex.vue";
import Icon from "./Toolbar/IconStyle.vue";
export default {
  data() {
    return {
      currentIndex: this.getInitialIndex(this.tilemap),
    };
  },
  components: {
    OnClickOutside,
    Interactive,
    Icon,
  },
  props: {
    tilemap: {
      type: Object,
    },
    updateTilemap: {
      type: Function,
    },
    canAddInteractive: {
      type: Function,
    },
    isOnline: Boolean,
  },
  computed: {
    interactive() {
      const {
        interactiveType,
        interactiveMsg,
        interactiveURL,
        resource,
      } = this.tilemap;
      return {
        interactiveType,
        interactiveMsg,
        interactiveURL,
        resource,
      };
    },
    ifHasDirection() {
      return this.tilemap.spin.status;
    },
    ifCollider() {
      return this.tilemap.isCollider;
    },
    ifMaskPlayer() {
      return this.tilemap.isMaskPlayer;
    },
    directionImg() {
      return this.tilemap.spin.images;
    },
  },
  watch: {
    // 物件更新的时候，重新计算 currentIndex
    tilemap(newVal, oldVal) {
      if (newVal.id !== oldVal.id) {
        const index = newVal.spin.images.findIndex(
          ({ url }) => url === newVal.imageURL
        );
        this.currentIndex = index > -1 ? index : 0;
      }
    },
  },
  methods: {
    getInitialIndex(tilemap) {
      const { status, images } = tilemap.spin;
      if (status) {
        const index = images.findIndex(({ url }) => url === tilemap.imageURL);
        if (index > -1) return index;
      }
      return 0;
    },
    handleIsMaskPlayerChange(isMaskPlayer) {
      this.updateTilemap(this.tilemap.id, { isMaskPlayer });
    },
    handleIsColliderChange(isCollider) {
      this.updateTilemap(this.tilemap.id, { isCollider });
    },
    interactiveChange({
      interactiveType,
      interactiveMsg,
      interactiveURL,
      resource,
    }) {
      // TODO: handle error
      const data = {
        interactiveType,
        interactiveMsg,
        interactiveURL,
        resource,
      };
      console.log("interactData====>",data)
      this.updateTilemap(this.tilemap.id, data);
      if (interactiveType !== INTERACTIVE_TYPE.DEFAULT) {
        Message.success(`${INTERACTIVE_TYPE_LABEL[interactiveType]}添加成功！`);
      }
    },
    turnLeftImg() {
      if (this.currentIndex < 1) {
        this.currentIndex = this.directionImg.length - 1;
      } else {
        this.currentIndex -= 1;
      }
      this.changeImageURL(this.currentIndex);
    },
    turnRightImg() {
      if (this.currentIndex < this.directionImg.length - 1) {
        this.currentIndex += 1;
      } else {
        this.currentIndex = 0;
      }
      this.changeImageURL(this.currentIndex);
    },
    changeImageURL(index) {
      const { name, url, w, h } = this.directionImg[index];
      const data = {
        name,
        imageURL: url,
        image: getNameFromImageURL(url),
        width: w,
        height: h,
        imagewidth: w,
        imageheight: h,
        tileNums: (w / CELL_WIDTH) * (h / CELL_HEIGHT),
      };
      this.updateTilemap(this.tilemap.id, data);
    },
  },
};
</script>
<style lang="scss" scoped>
* {
  padding: 0px;
}
.title {
  //styleName: Headline 4 - Bold;
  font-family: Noto Sans SC;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: left;
  display: block;
  margin: 24px 24px 16px 24px;
}
.preview {
  border-bottom: 1px solid #f6f6f6;
  :deep(.iconfont) {
    font-size: 20px;
  }
  .previewDisplay {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 0 32px 0;
    .direction-icon {
      height: 24px;
      width: 24px;
      margin: 0 24px 0 24px;
      background: #ffffff;
      /* Small button 2 */
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.15);
      border-radius: 20px;
      :hover {
        color: #8f7ef4;
      }
    }

    .direction-icon-disabled {
      height: 24px;
      width: 24px;
      margin: 0 24px 0 24px;
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.15);
      border-radius: 20px;
    }

    img {
      max-height: 64px;
      max-width: 64px;
      border-radius: 0px;
    }
    > div {
      display: flex;
      height: 96px;
      width: 96px;
      left: 48px;
      top: 0px;
      border-radius: 3px;
      background-color: #f5f5f5;
      align-items: center;
      justify-content: center;
    }
  }
}
.message-box {
  position: fixed;
  width: 440px;
  height: 188px;
  left: 0;
  right: 0;
  margin: -34px auto;
  background: red;
}
.propertyInteractive {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
}
.propertyFunction {
  border-bottom: 1px solid #f6f6f6;
  > div {
    margin: 0 24px 23px 24px;
  }
  span {
    font-family: Noto Sans SC;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: left;
  }
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: #8f7ef4;
    background-color: #8f7ef4;
  }
  :deep(.el-checkbox__inner) {
    border: 2px solid #e0e0e0;
    box-sizing: border-box;
    border-radius: 4px;
  }
  :deep(.el-icon-arrow-down:before) {
    content: none;
  }
  :deep(.el-icon-close:before) {
    content: none;
  }
  .el-checkbox {
    --el-checkbox-input-height: 16px;
    --el-checkbox-input-width: 16px;
    --el-checkbox-border-radius: 3px;
    --el-checkbox-input-border-color-hover: #e0e0e0;
    display: inline;
    top: 3px;
  }
}
</style>