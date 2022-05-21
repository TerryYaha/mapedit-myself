<template>
  <div class="material-empty">
    <div class="material-empty__content">
      <img
        class="material-empty__img"
        src="../../../../../../static/editor-material-empty.png"
      />
      <span class="material-empty__text">暂无相关素材～</span>
    </div>
  </div>
</template>

<style scoped>
.material-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.material-empty__content {
  width: 168px;
  height: 172px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.material-empty__img {
  width: 168px;
  height: 128px;
  cursor: default;
}
.material-empty__text {
  font-size: 12px;
  line-height: 20px;
  color: #B6B6B6;
}
</style>
