<template>
  <el-dialog v-model="visible" :show-close="false" width="36%" :close-on-click-modal="false" :close-on-press-escape="false">
    <div class="alert-box">
      <div class="alert-title">选择你要传送的位置</div>
      <div class="alert-text">传送后人物会出现在选中地图的出生点</div>
      <SelectSpaceItem
        :spaceList="spaceList"
        :setSpaceTransfer="setSpaceTransfer"
      />
      <div class="alert-button">
        <div class="alert-button--confirm">
          <div class="alert-button-close" @click="cancelFn">取消</div>
          <div class="alert-button-open" @click="confirmFn()">确定</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import SelectSpaceItem from "./SelectSpaceItem.vue";
import { getEventId } from "@/utils/cache";
import { getSpaces } from "@/api/api";
export default {
  components: {
    SelectSpaceItem,
  },
  props: {
    confirmFn: {
      type: Function,
    },
    selectedSpaceTransfer: Object,
    setSpaceTransfer: Function,
    clearSelectedSpace:Function
  },
  data() {
    return {
      page: {
        pageNum: 1,
        pageSize: 5,
      },
      spaceList: [],
      visible: false,
    };
  },

  methods: {
    cancelFn() {
      // close the dialog that a space selected as transfer target
      this.visible = false;
      this.clearSelectedSpace();
    },
    async getSpaceList() {
      const { pageNum, pageSize } = this.page;
      const eventId = await getEventId();
      const currSpace = this.$route.query.spaceId ?? '';
      const _url = `/space?id=${eventId.data}&eventId=${eventId.data}&sort=1&pageSize=${pageSize}&pageNum=${pageNum}`;
      getSpaces(_url).then((res) => {
        if (res.data.code === 200) {
          let tempSpaceList = res.data.data.list;
          this.spaceList = tempSpaceList.filter(space=>
              space.id !== currSpace
          )
        }
      });
    },
    // mapedit调用此 初始化是否需要禁用传送地块
    async getIsTransfer() {
      const eventId = await getEventId();
      const _url = `/space?id=${eventId.data}`;
      let isTransfer = true;
      await getSpaces(_url).then((res) => {
        if (res.data.code === 200) {
          isTransfer = res.data.data?.total >= 2;
        }
      });
      return isTransfer;
    },
  },
  mounted() {
    this.getSpaceList();
  },
};
</script>
<style lang="scss" scoped>
.alert-box {
  height: 100%;
  width: 90%;
  position: relative;
  opacity: 1;
  box-sizing: border-box;
  margin: -30px auto 0 auto;
}
.alert-title {
  width: 100%;
  height: 24px;
  font-size: 16px;
  font-weight: bold;
  color: #282c4a;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: start;
}
.alert-text {
  margin-top: 16px;
  width: 100%;
  max-height: 66px;
  font-size: 14px;
  font-weight: 400;
  color: rgba(40, 44, 74, 0.6);
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  text-align: start;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.alert-button {
  margin-top: 24px;
}
.alert-button--confirm {
  display: flex;
  justify-content: flex-end;
}
.alert-button--alert {
  display: flex;
  justify-content: flex-end;
}
.alert-button-open {
  display: inline-block;
  box-sizing: border-box;
  padding: 6px 12px;
  background: #8f7ef4;
  border-radius: 4px;
  margin-left: 8px;
  font-size: 12px;
  font-weight: bold;
  color: #f6f6f6;
  line-height: 20px;
  cursor: pointer;
}
.alert-button-close {
  display: inline-block;
  box-sizing: border-box;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #282c4a;
  line-height: 20px;
  cursor: pointer;
}
.alert-icon-close {
  font-size: 16px;
  position: absolute;
  right: 16px;
  top: 12px;
}
</style>