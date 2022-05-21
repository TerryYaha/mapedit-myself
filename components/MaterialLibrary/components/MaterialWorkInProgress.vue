<template>
  <div class="material-wip">
    <div class="material-wip__content">
      <img
        class="material-wip__img"
        src="../../../../../../static/editor-material-wip.png"
      />
      <span class="material-wip__text">还在施工，敬请期待～</span>
    </div>
  </div>
</template>

<style scoped>
.material-wip {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.material-wip__content {
  width: 168px;
  height: 172px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.material-wip__img {
  width: 168px;
  height: 128px;
  cursor: default;
}
.material-wip__text {
  font-size: 12px;
  line-height: 20px;
  color: #B6B6B6;
}
</style>
