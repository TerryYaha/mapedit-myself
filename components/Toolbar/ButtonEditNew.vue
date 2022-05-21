<!-- 编辑器button按钮 -->
<template>
  <div :class="['edit-button',myStyle]" :style="myStyleStr"> 
  <p v-text="msg" ></p>
  </div>
</template>

<script>
export default {
  props: {
    msg:{
      type:String,
      default:'button'
    },
    myStyle:{
      type:String,
      default:'primary' //disabled 失效样式 ，primary默认样式
    },
    myStyleStr:{
      type:String,
      default:''
    },
  },
  data() {
    return {
    
    };
  },
  methods: {},
};
</script>


<style scoped>
.edit-button {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border: 1px solid transparent;;
    cursor: pointer;
    overflow: hidden;
    text-align: center;
}
.my-button p{
  margin: 0px;
  height: 0px;
}

.primary{
    background: #8F7EF4;
    color: #fff;
    line-height: 40px;
    font-size: 14px;
    letter-spacing: 1px;
    border-radius: 4px;
}

.primary:hover {
  background: #8A9DF5;
}
.primary:active {
  background: #8A9DF5;
}
.disabled{
  background: #F6F6F6;
  color: #CFCFCF;
  line-height: 40px;
  font-size: 14px;
  letter-spacing: 1px;
  border-radius: 4px;
  cursor: not-allowed;
}
</style>