<template>
  <div :class="['attr-status', isError ? 'error' : '']">
    <div class="pic">
      <div class="load" v-show="!isError">
        <img
          v-show="!fileName"
          src="@/assets/image/mapedit/loading2.gif"
          style="width: 18px; height: 18px"
          alt=""
        />
        <IconFont
          v-show="fileName && !isHideSuccess"
          class="icon"
          type="icon-success"
        />
        <svg-icon
        class="svgIcon"
          v-show="fileName && isHideSuccess"
          :iconClass="svgImg"
        ></svg-icon>
      </div>
      <div class="load" v-show="isError">
        <IconFont class="icon" type="icon-fail" />
      </div>
    </div>
    <div class="file-info">
      <span class="file-name">{{ fileName ? fileName : defaultFileName }}</span>
      <span class="file-size" v-if="fileSize">{{
        fileSize ? fileSize + "MB" : ""
      }}</span>
    </div>
  </div>
</template>

<script>
import IconFont from "../../iconFont";
import { ResourceType } from "@/components/MapEditor/const";
export default {
  components: { IconFont },
  props: {
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    resourceType: Number,
  },
  data() {
    return {
      isHideSuccess: false,
    };
  },
  computed: {
    defaultFileName() {
      switch (this.resourceType) {
        case ResourceType.Document:
          return "xxxxxxxxxxxx.pdf";
        case ResourceType.Image:
          return "xxxxxxxxxxxx.jpg";
        case ResourceType.Video:
          return "xxxxxxxxxxxx.mp4";
        case ResourceType.Audio:
          return "xxxxxxxxxxxx.mp3";
      }
    },
    svgImg() {
      switch (this.resourceType) {
        case ResourceType.Document:
          return "file1";
        case ResourceType.Image:
          return "picture1";
        case ResourceType.Video:
          return "video1";
        case ResourceType.Audio:
          return "music1";
      }
    },
  },
  mounted() {
    if (!this.isHideSuccess)
      setTimeout(() => {
        this.isHideSuccess = true;
      }, 1000);
  },
  watch:{
    'fileName'(){
      if(this.fileName){
        this.isHideSuccess = false
        setTimeout(()=>{
          this.isHideSuccess = true
        },1000)
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.attr-status {
  display: flex;
  align-items: center;
  width: 192px;
  height: 64px;
  border-radius: 5px 5px 5px 5px;
  border: 1px solid #e0e0e0;
  background: #fff;
  .load {
    width: 40px;
    height: 40px;
    background: rgba(245, 245, 245, 0.5);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 11px;
    .svgIcon{
      width: 18px;
      height: 24px;
    }
  }
  .file-info {
    position: relative;
    right: 15px;
    margin-left: 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    font-weight: 400;
    overflow: hidden;
    // align-items: center;
    .file-name {
      color: #282c4a;
      line-height: 20px;
      font-size: 12px;
      font-family: Noto Sans SC-Regular, Noto Sans SC;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .file-size {
      font-size: 12px;
      font-family: Noto Sans SC-Regular, Noto Sans SC;
      color: #b9b9b9;
      line-height: 20px;
    }
  }
}
// error style
.error {
  // outline: none;
  border: 1px solid #e34d59 !important;
}
</style>
  
  

