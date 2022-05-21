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
            inputTextPlaceholder === '' ? '“墙壁”' : inputTextPlaceholder
          "
          :onClear="onClear"
        />
      </div>
      <div class="material__tags">
        <MaterialTag :item="item" :onTagsChange="onTagsChange" />
      </div>
      <div class="material__space" />
      <el-scrollbar ref="scrollbar" id="scrollbar">
        <div class="material__list noscrollbar">
          <MaterialEmpty v-if="isEmpty" />
          <MaterialListWall
            v-else
            ref="material"
            :objList="wallList"
            :selectedWallMaterial="selectedWallMaterial"
            :setWallMaterial="setWallMaterial"
          />
        </div>
        <!-- 底部加载样式 -->
        <load-more :isShow="isShow" :isLoading="isLoading"></load-more>
      </el-scrollbar>
    </div>
    <div class="material__wip" v-show="source === MaterialSource.Personal">
      <MaterialWorkInProgress />
    </div>
  </div>
</template>

<script>
import { getSysMaterial } from '../../../../api/api';
import { MaterialSource, WallType } from "../../const";
import { TileCategory } from '../../model';
import MaterialSourceTabs from "./components/MaterialSourceTabs";
import MaterialSearch from "./components/MaterialSearch";
import MaterialTag from "./components/MaterialTag";
import MaterialWorkInProgress from "./components/MaterialWorkInProgress.vue";
import MaterialListWall from "./components/MaterialListWall.vue";
import MaterialEmpty from "./components/MaterialEmpty";
import LoadMore from "./components/LoadMore.vue";
import { getInitialTagsByItem, getUuid } from '../../util';

export default {
  props: {
    item: {
      type: Object,
    },
    selectedWallMaterial: {
      type: Object,
    },
    setWallMaterial: {
      type: Function,
    },
  },
  components: {
    MaterialSourceTabs,
    MaterialSearch,
    MaterialTag,
    MaterialEmpty,
    MaterialWorkInProgress,
    MaterialListWall,
    LoadMore,
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
    wallList() {
      return this.list.map((wall) => {
          const { id, node, ...propsToKeep } = wall;
          const { type, images } = wall.node;
          wall.node.images = images.map(({ name, url }, index) => {
            if (type === WallType.Simple) {
              const shelter = [1, 2].includes(index + 1);
              const obstacle = [2, 3].includes(index + 1);
              return new TileCategory({
                ...propsToKeep,
                id: `${id}-part${index + 1}`,
                name,
                url,
                shelter,
                obstacle,
                w: 64,
                h: 64,
              });
            } else if (type === WallType.Complicated) {
              const shelter = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16].includes(index + 1);
              const obstacle = [5, 6, 7, 8, 9, 10, 11, 12, 17].includes(index + 1);
              return new TileCategory({
                ...propsToKeep,
                id: `${id}-part${index + 1}`,
                name,
                url,
                shelter,
                obstacle,
                w: 64,
                h: 64,
              });
            }
          });
          return wall;
        });
    },
  },
  mounted() {
    setTimeout(() => {
      const materialListHight = document.getElementById("scrollbar").clientHeight,
        materialHeight = 64 + 16; // 高+buttom距离
      let lineNum = Math.ceil(materialListHight / materialHeight);
      this.pageSize = lineNum * 3;
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
  methods: {
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
      this.setWallMaterial(null);
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
            console.log(res.data.data)
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

<style lang='scss' scoped>
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
.material__list {
  padding: 2px 16px 12px;
  flex: 1;
  overflow-y: auto;
  > div {
    margin-top: 10px;
  }
}
.material__wip {
  flex: 1;
}
.noscrollbar::-webkit-scrollbar {
  height: 0px;
  width: 0px;
}
</style>
