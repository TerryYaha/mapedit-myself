import {SavingStatus, NEW_LAYERS, OBJECT_TYPE } from '../const';
import Offset from './offset';
import Rect from './rect';
import eventBus from '../eventBus';
import { intersectRectRect, transformPoint } from '../util';

class Map {
  constructor() {
    this.objects = [];
  }

  get tilemaps() {
    return this.objects.filter((obj) => {
      return obj.__typename !== OBJECT_TYPE.BACKGROUND
        && obj.zIndex !== NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR
        && obj.zIndex !== NEW_LAYERS.FREE_OBJ_BELOW_AVATAR;
    });
  }

  get freeObjects() {
    return this.objects.filter((obj) => {
      return obj.zIndex === NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR
        || obj.zIndex === NEW_LAYERS.FREE_OBJ_BELOW_AVATAR;
    });
  }

  get images() {
    return this.freeObjects.filter((obj) => obj.__typename === OBJECT_TYPE.IMAGE);
  }

  get texts() {
    return this.freeObjects.filter((obj) => obj.__typename === OBJECT_TYPE.TEXT);
  }

  restore(objects) {
    this.objects = objects;
  }

  getObject(id) {
    return this.objects.find((obj) => obj.id === id);
  }

  addObject(object) {
    const { zIndex } = object;
    const indexToInsert = this.objects.findIndex((obj) => obj.zIndex > zIndex);
    if (indexToInsert === -1) {
      this.objects.push(object);
    } else {
      this.objects.splice(indexToInsert, 0, object);
    }
    this.addListenMapData()
  }

  updateObject(id, data) {
    const index = this.objects.findIndex((obj) => obj.id === id);
    if (index === -1) return;

    const object = this.objects[index];
    const { zIndex } = object;
    const { zIndex: newZIndex } = data;
    Object.assign(object, data);
    // 如果zIndex变化了需要调整object在this.objects中的位置
    if (newZIndex !== undefined && newZIndex !== zIndex) {
      this.objects.splice(index, 1);
      const indexToInsert = this.objects.findIndex((obj) => obj.zIndex > newZIndex);
      this.objects.splice(indexToInsert, 0, object);
    }
    this.addListenMapData()
  }

  removeObject(id) {
    const index = this.objects.findIndex((obj) => obj.id === id);
    if (index === -1) return;

    this.objects.splice(index, 1);
    this.addListenMapData()
  }

  addListenMapData(){ //监听地图数据变动
    eventBus.emit('ui:listenMapData', SavingStatus.NotSaved);
  }

  // TODO: 重命名下面几个查找函数，并添加注释
  findByPoint({ left, top }, zIndexList) {
    for (let i = 0; i < zIndexList.length; i++) {
      const zIndex = zIndexList[i];
      const obj = this.findByZIndexPoint({ zIndex, left, top });
      if (obj) return obj;
    }
    return null;
  }
  
  findByZIndexPoint({ zIndex, left, top }) {
    const point = new Offset(left, top);
    const objectsByZIndex = this.objects.filter((obj) => obj.zIndex === zIndex);
    return objectsByZIndex.reverse().find((obj) => {
      const { left, top, width, height, angle } = obj;
      const rect = Rect.fromLTWH(left, top, width, height);
      if (angle == null) {
        return rect.containPoint(point);
      } else {
        const transformedPoint = transformPoint(point, { left, top }, angle, window.fabric);
        return rect.containPoint(transformedPoint);
      }
    });
  }

  findAllByZIndexPoint({ zIndex, left, top }) {
    const point = new Offset(left, top);
    const objectsByZIndex = this.objects.filter((obj) => obj.zIndex === zIndex);
    return objectsByZIndex.filter((obj) => {
      const { left, top, width, height, angle } = obj;
      const rect = Rect.fromLTWH(left, top, width, height);
      if (angle == null) {
        return rect.containPoint(point);
      } else {
        const transformedPoint = transformPoint(point, { left, top }, angle, window.fabric);
        return rect.containPoint(transformedPoint);
      }
    });
  }

  findByRect({ left, top, width, height }, zIndexList, angle) {
    for (let i = 0; i < zIndexList.length; i++) {
      const zIndex = zIndexList[i];
      const obj = this.findByZIndexRect({ zIndex, left, top, width, height, angle });
      if (obj) return obj;
    }
    return null;
  }

  findAllByZIndexRect({ zIndex, left, top, width, height, angle }) {
    const rect = Rect.fromLTWH(left, top, width, height);
    const objectsByZIndex = this.objects.filter((obj) => obj.zIndex === zIndex);
    return objectsByZIndex.filter((obj) => {
      if (obj.angle == null && angle == null) {
        return Rect.fromLTWH(obj.left, obj.top, obj.width, obj.height).overlaps(rect);
      } else {
        const rect1 = { left, top, width, height, angle: angle ?? 0 };
        const rect2 = { left: obj.left, top: obj.top, width: obj.width, height: obj.height, angle: obj.angle ?? 0 };
        return intersectRectRect(rect1, rect2, window.fabric);
      }
    });
  }

  findByZIndexRect({ zIndex, left, top, width, height, angle }) {
    const rect = Rect.fromLTWH(left, top, width, height);
    const objectsByZIndex = this.objects.filter((obj) => obj.zIndex === zIndex);
    return objectsByZIndex.reverse().find((obj) => {
      if (obj.angle == null && angle == null) {
        return Rect.fromLTWH(obj.left, obj.top, obj.width, obj.height).overlaps(rect);
      } else {
        const rect1 = { left, top, width, height, angle: angle ?? 0 };
        const rect2 = { left: obj.left, top: obj.top, width: obj.width, height: obj.height, angle: obj.angle ?? 0 };
        return intersectRectRect(rect1, rect2, window.fabric);
      }
    });
  }

  moveAbove(id, targetId) {
    const indexToRemove = this.objects.findIndex((obj) => obj.id === id);
    const object = this.objects[indexToRemove];
    this.objects.splice(indexToRemove, 1);
    const indexToInsertAbove = this.objects.findIndex((obj) => obj.id === targetId);
    const indexToInsert = indexToInsertAbove + 1;
    this.objects.splice(indexToInsert , 0, object);
    this.addListenMapData()
  }

  moveBelow(id, targetId) {
    const indexToRemove = this.objects.findIndex((obj) => obj.id === id);
    const object = this.objects[indexToRemove];
    this.objects.splice(indexToRemove, 1);
    const indexToInsert = this.objects.findIndex((obj) => obj.id === targetId);
    this.objects.splice(indexToInsert , 0, object);
    this.addListenMapData()
  }
}

export default Map;
