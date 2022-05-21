<template>
  <div
    class="tool"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <IconFont class="tool__icon" type="a-icon-uploadpicture" />
    <div class="tool__dropdown" :class="{ 'tool__dropdown--visible': dropdownVisible }">
      <PersonalUploadMenu
        :uploadSticker="handleUploadSticker"
        :uploadBackground="handleUploadBackground"
      />
    </div>
  </div>
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
.tool {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
}

.tool:hover {
  border-radius: 4px;
  background: #F5F5F5;
}

.tool__icon {
  font-size: 24px;
}

.tool__dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  display: none;
  padding-top: 4px;
}

.tool__dropdown--visible {
  display: block;
}
</style>
