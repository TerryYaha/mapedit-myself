<template>
  <div class="material-empty">
    <div class="material-empty__content">
      <img
        class="material-empty__img"
        src="../../../../static/editor-material-sticker-empty.png"
      />
      <span class="material-empty__text"> 你还未上传贴图哦～ </span>
    </div>
  </div>
</template>

<style scoped>
.material-empty {
  min-height: 300px;
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
  margin-top: 2px;
  font-size: 12px;
  line-height: 20px;
  color: #b6b6b6;
}
</style>
