<template>
  <div class="save-map">
      <!-- 标题 -->
      <div class="title">
          <span>{{eventName}}</span>
          <span class="title__slash">/</span>
          <span>{{spaceName}}</span>
      </div>
      <!-- 保存状态提示 -->
      <div class="status" v-show="isSaving || saveTime || warnText">
          <div class="no-save" v-show="!isSaving && !warnText">{{saveTime}} 已保存</div>
          <div class="save-warn" v-show="warnText">{{warnText}}</div>
        <save-loading class="saving" v-show="isSaving"></save-loading>
      </div>
  </div>
</template>

<script>
import SaveLoading from "./SavingLoading.vue";
export default {
    components:{
        SaveLoading,
    },
    props:{
        eventName: {
            type: String,
        },
        spaceName: {
            type: String,
        },
        // 地图保存时间
        saveTime:{
            type:String,
            // default:"00:00",
        },
        // 保存状态
        isSaving:{
            type:Boolean,
            default:false,
        },
        warnText:String
    },
}
</script>

<style scoped lang="scss">
.save-map{
    display: flex;
    height: 64px;
    line-height: 64px;
    .title{
        color: #282C4A;
        font-size: 14px;
        display: flex;
    }
    .title__slash {
        margin-left: 8px;
        margin-right: 8px;
        width: 6px;
        text-align: center;
        color: #E0E0E0;
    }
}
.status{
    margin: auto 0;
    margin-left: 12px;
}
// 未保存样式
.no-save{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding:0 5px;
    font-size: 12px;
    width: 82px;
    height: 22px;
    background: #F1F4F7;
    color: #B6B6B6;
    border-radius: 3px;
}
.save-warn{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding:0 5px;
    font-size: 12px;
    height: 22px;
    background: #F1F4F7;
    color: #B6B6B6;
    border-radius: 3px;
}
</style>