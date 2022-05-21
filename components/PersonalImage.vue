<template>
  <div
    class="personal-image"
    :class="{
      'personal-image--selected': selected,
      'personal-image--status-uploading': image.status === 'uploading',
      'personal-image--status-fail': image.status === 'fail'
    }"
  >
    <div class="personal-image__pic">
      <RetryImg
        v-if="image.url"
        class="personal-image__img"
        :src="image.url"
      />
      
      <div
        class="personal-image__mask"
      >
        <div
          v-if="image.status === 'success' || image.status === 'fail'"
          class="personal-image__delete"
          @click="handleRemove"
        >
          <IconFont type="icon16px-delete" />
        </div>

        <div v-if="image.status === 'uploading'" class="personal-image__progress">
          <div class="personal-image__progress-bar">
            <div
              class="personal-image__progress-bar-active"
              :style="{ width: progressWidth + 'px' }"
            />
          </div>
          <div class="personal-image__progress-text">上传中...</div>
        </div>

        <div v-if="image.status === 'fail'" class="personal-image__fail">
          <IconFont class="personal-image__fail-icon" type="icon-fail" />
          <div class="personal-image__fail-text">上传失败</div>
        </div>
      </div>
      <span v-if="isBackground" class="personal-image__tag">背景图</span>
    </div>
    <div class="personal-image__name">{{image.name}}</div>
  </div>
</template>

<script>
import IconFont from "./iconFont";
import RetryImg from "./RetryImg";

export default {
  components: {
    IconFont,
    RetryImg,
  },
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
    isBackground: {
      type: Boolean,
      default: false,
    },
    image: {
      // 类型 UploadFile
      type: Object,
    },
    onRemove: {
      type: Function,
    },
  },
  computed: {
    progressWidth() {
      const percentage = this.image?.percentage ?? 0;
      const barWidth = 84;
      return barWidth * percentage / 100;
    },
  },
  methods: {
    handleRemove(e) {
      e.stopPropagation();
      this.onRemove(this.image);
    },
  },
};
</script>

<style scoped>
.personal-image {
  width: 104px;
  height: 128px;
  cursor: pointer;
}

.personal-image__pic {
  position: relative;
  overflow: hidden;
  height: 104px;
  border-radius: 3px;
}

.personal-image--selected .personal-image__pic {
  outline: 2px solid #8F7EF4;
  outline-offset: 2px;
}

.personal-image__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.personal-image__mask {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.personal-image:hover .personal-image__mask,
.personal-image--status-uploading .personal-image__mask,
.personal-image--status-fail .personal-image__mask {
  display: block;
}

.personal-image__delete {
  position: absolute;
  right: 4px;
  top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 3px;
  font-size: 16px;
  color: #fff;
}

.personal-image__delete:hover {
  background: #8F7EF4;
}

.personal-image__progress {
  position: absolute;
  left: 0;
  top: 50px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.personal-image__progress-bar {
  position: relative;
  width: 84px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

.personal-image__progress-bar-active {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 4px;
  background: #FFFFFF;
  border-radius: 4px;
}

.personal-image__progress-text {
  margin-top: 4px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  color: #fff;
  opacity: 0.8;
}

.personal-image__fail {
  position: absolute;
  left: 0;
  top: 30px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.personal-image__fail-icon {
  font-size: 24px;
  color: #E34D59;
}

.personal-image__fail-text {
  margin-top: 4px;
  font-size: 12px;
  line-height: 20px;
  color: #FFFFFF;
  opacity: 0.8;
}

.personal-image__tag {
  position: absolute;
  left: 4px;
  top: 4px;
  padding: 0px 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  background: #8F7EF4;
  border-radius: 3px;
}

.personal-image__name {
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  color: #282C4A;
  opacity: 0.8;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
