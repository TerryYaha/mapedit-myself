<template>
  <div class="MaterialTag-list-theme">{{ item.name }}</div>
  <IconFont
    class="tag-close-icon"
    :type="[isCollapsed ? 'icon16px-down' : 'icon16px-up']"
    @click="toggleCollapsed"
  />
  <div
    class="MaterialTag-list-open"
    :class="{ 'MaterialTag-list-open--hide': isCollapsed }"
  >
    <div
      class="MaterialTag-list-item"
      :class="{ check: tagIndex === -1 }"
      @click="chooseTag(-1)"
    >
      全部
    </div>
    <div
      class="MaterialTag-list-item"
      :class="{ check: tagIndex === index }"
      v-for="(item, index) in item.children"
      :key="item.id"
      @click="chooseTag(index, item.name)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script>
import IconFont from "../../iconFont";

export default {
  components: {
    IconFont,
  },
  props: {
    item: {
      type: Object,
    },
    index: {
      type: Number,
    },
    onTagIndexChange: {
      type: Function,
    },
  },
  data() {
    return {
      isCollapsed: false,
      tagIndex: -1,
      inputTextPlaceholder: "",
    };
  },
  methods: {
    toggleCollapsed() {
      this.isCollapsed = !this.isCollapsed;
    },
    chooseTag(tagIndex, tagName) {
      if (this.tagIndex != tagIndex) {
        this.tagIndex = tagIndex;
        this.onTagIndexChange(this.index, tagIndex);
        this.generatePlaceholder(tagName);
        this.inputTextPlaceholder = "";
      }
    },
    generatePlaceholder(tagName) {
      this.$parent.tagName[this.index] = tagName;
      for (let i = 0; i <= this.$parent.tagName.length; i++) {
        if (this.$parent.tagName[i]) {
          this.inputTextPlaceholder +=
            this.inputTextPlaceholder === ""
              ? `“${this.$parent.tagName[i]}”`
              : " 和 " + `“${this.$parent.tagName[i]}”`;
        }
      }
      this.$parent.$parent.inputTextPlaceholder = this.inputTextPlaceholder;
    },
  },
};
</script>

<style lang="scss" scoped>
.MaterialTag-list-theme {
  font-size: 12px;
  font-weight: 400;
  color: #282c4a;
  box-sizing: border-box;
  padding: 2px;
  text-align: start;
}
.tag-close-icon {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #282C4A;
}

.MaterialTag-list-open {
  width: 100%;
  position: relative;
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  .MaterialTag-list-item {
    height: 20px;
    font-size: 12px;
    font-weight: 400;
    color: #282c4a;
    margin-right: 12px;
    box-sizing: border-box;
    padding: 4px;
    cursor: pointer;
  }
  .check {
    font-weight: bold;
  }
}

.MaterialTag-list-open--hide {
  display: none;
}
</style>