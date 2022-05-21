<template>
  <div class="material">
    <div class="material__tabs">
      <MaterialSourceTabs :source="source" :onSourceChange="onSourceChange" />
    </div>
    <div class="material__content" v-show="source === MaterialSource.Official">
      <div class="material__search">
        <MaterialSearch
          :onSearch="onSearch"
          :materialSearchType="
            inputTextPlaceholder === '' ? '“贴图”' : inputTextPlaceholder
          "
          :onClear="onClear"
        />
      </div>
      <div class="material__tags">
        <MaterialTag :item="item" :onTagsChange="onTagsChange" />
      </div>
      <div class="material__space" />
      <el-scrollbar ref="scrollbar" always id="scrollbar">
        <div class="material__list noscrollbar">
          <MaterialEmpty v-if="isEmpty" />
          <MaterialListSticker
            v-else
            :objList="list"
            :selectedStickerMaterial="selectedStickerMaterial"
            :setStickerMaterial="setStickerMaterial"
          />
        </div>
        <!-- 底部加载样式 -->
        <load-more :isShow="isShow" :isLoading="isLoading"></load-more>
      </el-scrollbar>
    </div>
    <div class="material__content" v-show="source === MaterialSource.Personal">
      <PersonalImageList
        :selectedStickerMaterial="selectedStickerMaterial"
        :setStickerMaterial="setStickerMaterial"
        :backgroundImage="backgroundImage"
        :addBackgroundImage="addBackgroundImage"
        :removeBackgroundImage="removeBackgroundImage"
        :personalStickers="personalStickers"
        :addPersonalSticker="addPersonalSticker"
        :removePersonalSticker="removePersonalSticker"
      />
    </div>
  </div>
</template>

<script>
import { getSysMaterial } from '../../../../api/api';
import { MaterialSource } from "../../const";
import MaterialSearch from "./components/MaterialSearch";
import MaterialTag from "./components/MaterialTag.vue";
import MaterialSourceTabs from "./components/MaterialSourceTabs.vue";
import MaterialEmpty from "./components/MaterialEmpty.vue";
import MaterialListSticker from "./components/MaterialListSticker.vue";
import LoadMore from "./components/LoadMore.vue";
import { getInitialTagsByItem, getUuid } from '../../util';
import PersonalImageList from '../PersonalImageList.vue';
import eventBus from '../../eventBus';

export default {
  props: {
    item: {
      type: Object,
    },
    selectedStickerMaterial: {
      type: Object,
    },
    setStickerMaterial: {
      type: Function,
    },
    backgroundImage: {
      type: Object,
    },
    addBackgroundImage: {
      type: Function,
    },
    removeBackgroundImage: {
      type: Function,
    },
    personalStickers: {
      type: Array,
    },
    addPersonalSticker: {
      type: Function,
    },
    removePersonalSticker: {
      type: Function,
    },
  },
  components: {
    MaterialSearch,
    MaterialTag,
    MaterialSourceTabs,
    MaterialEmpty,
    MaterialListSticker,
    LoadMore,
    PersonalImageList,
  },
  data() {    
    return {
      MaterialSource,
      source: MaterialSource.Official,
      keyword: "",
      tags: getInitialTagsByItem(this.item),
      condition: 'or',
      pageNum: 1,
      list: [],
      pageSize: 30,
      isLastPage: false,
      isLoading: true, //资源加载状态
      isShow: false, // 是否展示加载组件
      isShowTags:true, //是否展示标签部分
      inputTextPlaceholder: "",
      materialListHeight: "", // 原材料物品组件素材高度
      materialHeight: "", // 单个素材高度
    };
  },
  computed: {
    isEmpty() {
      return this.list.length === 0;
    },
  },
  mounted() {
    this.registerEvents();

    setTimeout(() => {
      const materialListHight = document.getElementById("scrollbar").clientHeight,
        materialHeight = 128 + 16; // 高+buttom距离
      let lineNum = Math.ceil(materialListHight / materialHeight);
      this.pageSize = lineNum * 2;
      this.fetchData({
        pageNum: this.pageNum,
        keyword: this.keyword,
        tags: this.tags,
        condition: this.condition,
        pageSize:this.pageSize
      });
      this.addListen();
    }, 1000);
  },
  beforeUnmount() {
    this.unregisterEvents();
  },
  methods: {
    registerEvents() {
      eventBus.on('ui:uploadBackground', this.switchTabPersonal);
      eventBus.on('ui:uploadSticker', this.switchTabPersonal);
    },
    unregisterEvents() {
      eventBus.off('ui:uploadBackground', this.switchTabPersonal);
      eventBus.off('ui:uploadSticker', this.switchTabPersonal);
    },
    switchTabPersonal() {
      this.source = MaterialSource.Personal;
    },
      // 监听滚动条触底事件
    addListen() {
      this.$refs.scrollbar.handleScroll = () => {
        var wrap = this.$refs.scrollbar.wrap;
        this.$refs.scrollbar.moveY = (wrap.scrollTop * 100) / wrap.clientHeight;
        this.$refs.scrollbar.moveX = (wrap.scrollLeft * 100) / wrap.clientWidth;
        let poor = wrap.scrollHeight - wrap.clientHeight;
        if (
          poor == parseInt(wrap.scrollTop) ||
          poor == Math.ceil(wrap.scrollTop) ||
          poor == Math.floor(wrap.scrollTop)
        ) {
          if (!this.isShow) {
            this.isShow = true;
            if (!this.isLastPage) {
              this.fetchData({
                pageNum: ++this.pageNum,
                pageSize: this.pageSize,
                name: this.keyword,
                tags: this.tags,
                condition: this.condition,
              });
            } else {
              this.isLoading = false;
            }
          }
        }
      };
    },
    onSourceChange(source) {
      this.source = source;
    },
    onClear() {
      this.isShowTags = true;
    },
    onTagsChange(tags, condition) {
      this.list = [];
      this.tags = tags;
      this.condition = condition;
      this.pageNum = 1;

      this.fetchData({
        pageNum: this.pageNum,
        tags,
        condition,
      });
      this.clearSelected();
    },
    onSearch(keyword, isClear) {
      if (keyword || isClear) {
        this.list = [];
        this.keyword = keyword;
        this.pageNum = 1;
        this.fetchData({
          pageNum: this.pageNum,
          tags: this.tags,
          condition: this.condition,
          keyword,
        });
        this.clearSelected();
        this.isShowTags = false;
      }
    },
    clearSelected() {
      // 列表变化时清除选中的物件素材
      this.setStickerMaterial(null);
    },
    fetchData({ pageNum, keyword = "", tags = [], condition, pageSize = this.pageSize, }) {
      const params = {
        pageNum,
        name: keyword,
        pageSize,
        navigationIds: tags,
        condition,
      };
      getSysMaterial(params)
        .then((res) => {
          if (res.data.code === 200) {
            const newList = res.data.data.list.map((item) => ({ ...item, id: item.code }));
            this.list = this.list.concat(newList);
            this.isLastPage = res.data.data.isLastPage;
            if(this.isLastPage && !this.isEmpty){
                this.isShow = true;
                this.isLoading = false;
            }else{
                this.isShow = false;
            }
          } else {
            // TODO:
          }
        })
        .catch(() => {
          // TODO:
        });
    },
    fetchMore() {
      // TODO: 加载下一页
    },
  },
};
</script>

<style scoped>
.material {
  height: 100%;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
}
.material__tabs {
  flex: none;
  padding: 0 16px;
}
.material__content {
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.material__search {
  padding: 0 16px;
}
.material__tags {
  padding: 0 16px;
}
.material__space {
  height: 12px;
}
.material__list {
  padding: 4px 16px 8px;
  flex: 1;
  overflow-y: auto;
}
.material__wip {
  flex: 1;
}
.noscrollbar::-webkit-scrollbar {
  height: 0px;
  width: 0px;
}
</style>