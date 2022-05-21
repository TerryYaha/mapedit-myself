<template>
  <div class="property" v-if="isTilemap||isImage||isText">
    <div class="property__inner noscrollbar">
      <Tilemap
        v-if="isTilemap"
        :tilemap="object"
        :updateTilemap="updateTilemap"
        :canAddInteractive="canAddInteractiveForTilemap"
        :isOnline="isOnline"
      />
      <Image v-if="isImage" :image="object" :updateImage="updateImage" />
      <Text v-if="isText" :text="object" :updateText="updateText" />
    </div>
  </div>
</template>

<script>
import Tilemap from './Tilemap.vue';
import Image from './Image.vue';
import Text from './Text.vue';
import { NEW_LAYERS, OBJECT_TYPE } from '../const';

export default {
  components: {
    Tilemap,
    Image,
    Text,
  },
  props: {
    object: {
      type: Object,
    },
    updateTilemap: {
      type: Function,
    },
    updateImage: {
      type: Function,
    },
    updateText: {
      type: Function,
    },
    canAddInteractive: {
      type: Function,
    },
    isOnline:Boolean,
  },
  computed: {
    isTilemap() {
      if (this.object == null) return false;
      const { __typename, zIndex } = this.object;
      return __typename === OBJECT_TYPE.TILEMAP
        && (zIndex === NEW_LAYERS.OBJ_ABOVE_AVATAR || zIndex === NEW_LAYERS.OBJ_BELOW_AVATAR);
    },
    isImage() {
      if (this.object == null) return false;
      return this.object.__typename === OBJECT_TYPE.IMAGE;
    },
    isText() {
      if (this.object == null) return false;
      return this.object.__typename === OBJECT_TYPE.TEXT;
    },
  },
  methods: {
    canAddInteractiveForTilemap() {
      return this.canAddInteractive(this.object);
    },
  },
};
</script>

<style scoped>
.noscrollbar::-webkit-scrollbar {
  height: 0px;
  width: 0px;
}

.property {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 100%;
  box-shadow: -2px 0px 6px rgba(0, 0, 0, 0.04);
  background: #fff;
}

.property__inner {
  position: relative;
  overflow: auto;
  flex: 1;
}
</style>
