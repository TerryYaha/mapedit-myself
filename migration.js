import { USER_LAYER, USER_LAYER_TO_LAYERS } from './const';
import { Tilemap, Image, Text } from './model';
import { getUuid, mapToList } from './util';

function migrateFromCanvasJson(canvasJson) {
  if (canvasJson == null) {
    return {
      tilemaps: [],
      images: [],
      texts: [],
    };
  }

  const tilemaps = [];
  const images = [];
  const texts = [];
  canvasJson.objects.forEach((obj) => {
    if (obj.type === 'image' && !obj.isCustomImage) {
      const tilemap = objToTilemap(obj);
      tilemaps.push(tilemap);
    } else if (obj.type === 'image' && obj.isCustomImage) {
      const image = objToImage(obj);
      images.push(image);
    } else if (obj.type === 'i-text') {
      const text = objToText(obj);
      texts.push(text);
    }
  });
  return {
    tilemaps,
    images,
    texts,
  };
}

function objToTilemap(obj) {
  const {
    zIndex,
    left,
    top,
    width,
    height,
    scaleX,
    scaleY,
    tileInfo,
  } = obj;
  return new Tilemap({
    id: getUuid(),
    zIndex,
    left,
    top,
    width: width * scaleX,
    height: height * scaleY,
    imageURL: tileInfo.imageURL,
    tileID: tileInfo.tileID,
    userLayer: getUserLayerFromLayer(zIndex),
    isBigObj: tileInfo.isBigObj,
    isCollider: tileInfo.isCollider,
    isMaskPlayer: tileInfo.isMaskPlayer,
    isbirth: tileInfo.isbirth,
    isPrivateSpace: tileInfo.isPrivateSpace,
    isPortal:tileInfo.isPortal,
    targetMap:tileInfo.targetMap,
    describe: tileInfo.describe,
    imageheight: height,
    imagewidth: width,
    name: tileInfo.name,
    tileLeft: left / tileInfo.tilewidth,
    tileNums: tileInfo.tileNums,
    tileTop: top / tileInfo.tileheight,
    tileheight: tileInfo.tileheight,
    tilewidth: tileInfo.tilewidth,
    interactiveType: tileInfo.interactiveType,
    interactiveURL: tileInfo.interactiveURL,
    interactiveMsg: tileInfo.interactiveMsg,
  });
}

function objToImage(obj) {
  const {
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
    scaleX,
    scaleY,
  } = obj;
  return new Image({
    id: getUuid(),
    zIndex,
    left,
    top,
    width: width * scaleX,
    height: height * scaleY,
    imageURL,
    imageWidth: width,
    imageHeight: height,
  });
}

function objToText(obj) {
  const {
    zIndex,
    left,
    top,
    width,
    height,
    text,
    fontSize,
    fill,
  } = obj;
  return new Text({
    id: getUuid(),
    zIndex,
    left,
    top,
    width,
    height,
    content: text,
    fontSize,
    color: fill,
  });
}

function getUserLayerFromLayer(layer) {
  const userLayers = mapToList(USER_LAYER);
  for (let i = 0; i < userLayers.length; i++) {
    const userLayer = userLayers[i];
    const layers = USER_LAYER_TO_LAYERS[userLayer];
    if (layers && layers.includes(layer)) {
      return userLayer;
    }
  }
  return null;
}

export {
  migrateFromCanvasJson,
};
