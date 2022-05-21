<!-- head工具栏操作小图标 --> 
<template>
  <div class="list-container">
    <div class="head-left">
      <Icon class="goback" iconType="icon16px-left" content="返回" @click="navigateBack"></Icon>
      <ul class="de-action">
        <li v-for="item in iconList" :key="item.id">
          <Icon
            v-if="item.tool === Tool.Copy"
            class="icon"
            :iconType="item.icon"
            :action="item.tool === selectedTool ? 'active' : 'disabled'"
            @click="changeTool(item.tool)"
          ></Icon>
          <el-tooltip
            v-else
            :content="item.warnText"
            placement="bottom"
          >
            <Icon
              class="icon"
              :iconType="item.icon"
              :action="item.tool === selectedTool ? 'active' : ''"
              @click="changeTool(item.tool)"
            ></Icon>
          </el-tooltip>
        </li>
        <li key="upload">
          <PersonalUploadTool
            :uploadSticker="uploadSticker"
            :uploadBackground="uploadBackground"
          />
        </li>
      </ul>
      <ul v-if="false" class="nav-action">
        <li>
          <el-tooltip content="撤销" placement="bottom">
            <Icon class="iconfont" iconType="icon-undo"></Icon>
          </el-tooltip>
        </li>
        <li>
          <el-tooltip content="重做" placement="bottom">
            <Icon class="iconfont" iconType="icon-redo"></Icon>
          </el-tooltip>
        </li>
      </ul>
    </div>
    <SaveMapStatus :isSaving="isSaving" :warnText="warnText" :saveTime="nowTime" :eventName="eventName" :spaceName="spaceName" />
    <div class="head-right">
      <ButtonEditNew msg="保存地图" class="save-btn" @click="saveMap" :myStyle="isDisabledBtn?'disabled':'primary'"/>
    </div>
  </div>
</template>
<script>
import { Tool } from '../../const';
import Icon from "./IconStyle.vue";
import SaveMapStatus from './SaveMapStatus.vue';
import ButtonEditNew from './ButtonEditNew.vue';
import PersonalUploadTool from '../PersonalUploadTool.vue';

export default {
  components: {
    Icon,
    SaveMapStatus,
    ButtonEditNew,
    PersonalUploadTool,
},
  props: {
    eventName: {
      type: String,
    },
    spaceName: {
      type: String,
    },
    selectedTool: {
      type: String,
    },
    changeTool: {
      type: Function,
    },
    navigateBack: {
      type: Function,
    },
    saveMap: {
      type: Function,
    },
    nowTime:String,
        // 保存状态
    isSaving:{
        type:Boolean,
        default:false,
    },
    isDisabledBtn:{
      type:Boolean,
      default:false
    },
    warnText:String,
    uploadSticker: {
      type: Function,
    },
    uploadBackground: {
      type: Function,
    },
  },
  data() {
    return {
      Tool,
      iconList: [
        {
          id: 1,
          icon: "icon-select",
          warnText: "选择",
          tool: Tool.Select,
        },
        {
          id: 2,
          icon: "icon-copy",
          warnText: "复制",
          tool: Tool.Copy,
        },
        {
          id: 3,
          icon: "icon-delete",
          warnText: "擦除",
          tool: Tool.Eraser,
        },
        {
          id: 4,
          icon: "icon-move",
          warnText: "拖动",
          tool: Tool.Hand,
        },
        {
          id: 5,
          icon: "a-icon-text",
          warnText: "文字",
          tool: Tool.InsertText,
        },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
.list-container {
  height: 64px;
  width: 100%;
  margin: 0 auto;
  padding: 0 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #282c4a;
  background: #FFFFFF;
box-shadow: 0px 4px 10px 10px rgba(0, 0, 0, 0.03);
  .head-left {
    display: flex;
    flex: 1;
    .iconfont {
      width: 38px;
      height: 24px;
      font-size: 20px;
    }
    .goback {
      cursor: pointer;
      width: 76px;
      height: 40px;
      padding-right: 14px;
      justify-content: space-around;
    }
    ul {
      display: flex;
    }
    // 复制、删除、拖动等编辑地图按钮
    .de-action {
      margin-left: 12px;
      .icon {
        width: 42px;
        height: 40px;
      }
      &::before{
          position: relative;
        content: "";
          top: 0;
          bottom: 0;
          right: 12px;
          margin: auto;
          width: 1px;
          height: 24px;
    background: #F5F5F5;

      }
    }
    // 撤销、重做按钮
    .nav-action {
      margin-left: 21px;
      .iconfont {
        width: 42px;
        height: 40px;
      }
      &::after{
        position: relative;
    content: "";
        top: 0;
        bottom: 0;
        left: 12px;
        margin: auto;
        width: 1px;
        height: 24px;
        background: #F5F5F5;
      }
    }
  }

  // 保存按钮
  .save-btn {
    position: absolute;
    right: 0;
    width: 112px;
    height: 40px;
  }
  // 地图缩放按钮
  .head-right {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: right;
    width: 250px;
    height: 40px;
    .zoom {
    //   width: 130px;
    }
  }
}
</style>