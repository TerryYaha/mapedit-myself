import { LAYER, NEW_LAYERS } from "./const";

//用转化老的图层和新的图层的关系
const OLDLAYER_TO_NEWLAYER = {
  [LAYER.FLAG_OBJ]: NEW_LAYERS.FLAG_OBJ,
  [LAYER.SMALL_OBJ]: NEW_LAYERS.OBJ_ABOVE_AVATAR,
  [LAYER.BIG_OBJ]: NEW_LAYERS.OBJ_ABOVE_AVATAR,
  [LAYER.WALL_FRONT]: NEW_LAYERS.WALL_FRONT,
  [LAYER.COLLIDER]: NEW_LAYERS.AVATAR,
  [LAYER.WALL_BEHIND]: NEW_LAYERS.WALL_BEHIND,
  [LAYER.NO_COLLIDER_OBJ]: NEW_LAYERS.OBJ_BELOW_AVATAR,
  [LAYER.GROUND]: NEW_LAYERS.GROUND,
  [NEW_LAYERS.FLAG_OBJ]: NEW_LAYERS.FLAG_OBJ
}

//把老的文字和图片映射到新的图层中
const IMAGGES_TEXT_TO_NEW_MAPS = {
  [LAYER.FLAG_OBJ]: NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR,
  [LAYER.SMALL_OBJ]: NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR,
  [LAYER.BIG_OBJ]: NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR,
  [LAYER.WALL_FRONT]: NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR,
  [LAYER.COLLIDER]: NEW_LAYERS.FREE_OBJ_BELOW_AVATAR,
  [LAYER.WALL_BEHIND]: NEW_LAYERS.FREE_OBJ_BELOW_AVATAR,
  [LAYER.NO_COLLIDER_OBJ]: NEW_LAYERS.FREE_OBJ_BELOW_AVATAR,
  [LAYER.GROUND]: NEW_LAYERS.FREE_OBJ_BELOW_AVATAR
};

export const resetTilemapszIndex = (tilemaps) => {
  tilemaps.forEach(tilemap => {
    const { zIndex } = tilemap;
    const newzIndex = OLDLAYER_TO_NEWLAYER[zIndex];
    console.log(`old:[${zIndex}] => new:[${newzIndex}]`);
    tilemap.zIndex = newzIndex;
  })
}

export const resetTextorImgzIndex = (data) => {
  data.forEach(d => {
    const { zIndex } = d;
    const newzIndex = IMAGGES_TEXT_TO_NEW_MAPS[zIndex];
    console.log(`old:[${zIndex}] => new:[${newzIndex}]`);
    d.zIndex = newzIndex;
  })
}