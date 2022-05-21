<template>
  <div class="menu">
    <div class="menu-item" role="button" @click="uploadSticker">
      <div class="menu-item__title">上传个人贴图</div>
      <div class="menu-item__description">
        支持2048*2048px以内，小于3MB，JPG、JPEG、PNG、BMP格式
      </div>
    </div>
    <div class="menu-divider" />
    <div class="menu-item" role="button" @click="uploadBackground">
      <div class="menu-item__title">
        上传背景图
        <el-tooltip content="查看帮助指南" placement="top">
          <IconFont
            type="info"
            class="menu-item__title-icon"
            @click="openHelpCenter"
          />
        </el-tooltip>
      </div>
      <div class="menu-item__description">
        支持8000*8000px以内，小于20MB，JPG、JPEG、PNG、BMP格式
      </div>
    </div>
  </div>
</template>

<script>
import IconFont from "./iconFont";

export default {
  components: {
    IconFont,
  },
  props: {
    uploadSticker: {
      type: Function,
    },
    uploadBackground: {
      type: Function,
    },
  },
  methods: {
    openHelpCenter(e) {
      e.stopPropagation();
      window.open(
        "https://www.wolai.com/vland/2TT7damvrzLWtyg6hKNpsu",
        "_blank"
      );
    },
  },
};
</script>

<style scoped>
.menu {
  border: 1px solid #e0e0e0;
  padding: 8px;
  width: 232px;
  background: #ffffff;
  border-radius: 5px;
  filter: drop-shadow(2px 0px 6px rgba(0, 0, 0, 0.04));
}

.menu-item {
  padding: 12px;
  text-align: left;
}

.menu-item:hover,
.menu-item:active {
  background: #f5f5f5;
  border-radius: 5px;
}

.menu-item__title {
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #282c4a;
}

.menu-item__title-icon {
  margin-left: 4px;
  font-size: 16px;
  color: #e0e0e0;
}

.menu-item__description {
  margin-top: 4px;
  font-size: 10px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.3);
}

.menu-divider {
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}
</style>
