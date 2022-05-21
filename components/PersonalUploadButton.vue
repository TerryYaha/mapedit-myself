<template>
  <button
    class="button"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <IconFont class="button__icon" type="icon-upload" />
    <span class="button__text">
      上传图片
    </span>
    <div class="button__dropdown" :class="{ 'button__dropdown--visible': dropdownVisible }">
      <PersonalUploadMenu
        :uploadSticker="handleUploadSticker"
        :uploadBackground="handleUploadBackground"
      />
    </div>
  </button>
</template>

<script>
import IconFont from './iconFont';
import PersonalUploadMenu from './PersonalUploadMenu.vue';

export default {
  components: {
    IconFont,
    PersonalUploadMenu,
  },
  props: {
    uploadSticker: {
      type: Function,
    },
    uploadBackground: {
      type: Function,
    },
  },
  data() {
    return {
      dropdownVisible: false,
    };
  },
  methods: {
    handleMouseEnter() {
      this.dropdownVisible = true;
    },
    handleMouseLeave() {
      this.dropdownVisible = false;
    },
    handleUploadSticker() {
      this.dropdownVisible = false;
      this.uploadSticker();
    },
    handleUploadBackground() {
      this.dropdownVisible = false;
      this.uploadBackground();
    },
  },
};
</script>

<style scoped>
.button {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  width: 232px;
  height: 36px;
  border: 1px solid #F5F5F5;
  border-radius: 4px;
  color: #282C4A;
}

.button__icon {
  margin-right: 10px;
  font-size: 24px;
}

.button__text {
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
}

.button__dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  display: none;
  padding-top: 4px;
}

.button__dropdown--visible {
  display: block;
}
</style>
