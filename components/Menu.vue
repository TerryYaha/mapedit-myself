<template>
  <div class="menu">
    <template
      v-for="option in options"
      :key="option.key"
    >
      <div v-if="option === 'divider'" class="menu-divider" />
      <div v-else class="menu-item" @click="onSelect(option.key)">{{option.label}}</div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array, // [{ key, label }, 'divider']
      default: [],
    },
    onSelect: {
      type: Function,
    },
  },
};
</script>

<style scoped>
.menu {
  width: 132px;
  padding: 4px;
  background: #fff;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.menu :not(:first-child),
.menu-divider {
  margin-top: 4px;
}

.menu-item {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #282C4A;
  font-size: 12px;
  line-height: 20px;
}

.menu-item:hover {
  background: #F6F6F6;
  border-radius: 2px;
}

.menu-divider {
  height: 1px;
  background: #E0E0E0;
  border-radius: 1px;
}
</style>
