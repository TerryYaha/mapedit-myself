import { ElMessageBox } from 'element-plus';
import { CELL_HEIGHT, CELL_WIDTH, DEFAULT_LINE_HEIGHT, INTERACTIVE_TYPE, MAX_CANVAS_SIZE, MESSAGE_BOX_CUSTOM_CLASS, NEW_LAYERS, OBJECT_TYPE, OVERLAY_CUSTOM_CLASS, TextAlign, TileEffectType, USER_LAYER } from './const';
import eventBus from './eventBus';
import { createCrossOriginImage, getModeByZIndex, getUuid, getZIndex, getZIndexListByMode, handleError, rotateRect } from './util';
import { Tilemap, Text, Image, Rect, Background, Offset } from './model';
import { groupTilemaps, compositeIamges } from './group';

const layers = Object.values(NEW_LAYERS).sort();

class BusinessLogic {
  constructor({ store, width, height, canvas, getMode }) {
    this.store = store;
    this.width = width;
    this.height = height;
    this.mapRect = new Rect.fromLTWH(0, 0, width * CELL_WIDTH, height * CELL_HEIGHT);
    this.canvas = canvas;
    this.getMode = getMode;
  }

  restore(objects) {
    this.store.restore(objects);
    return this.canvas.restore(objects);
  }

  hasBirthPoint() {
    return this.store.tilemaps.some((tilemap) => tilemap.isbirth);
  }
  
  save() {
    const tilemaps = this.store.tilemaps;
    const objAboveAvatarList = tilemaps.filter(({ zIndex }) => zIndex === NEW_LAYERS.OBJ_ABOVE_AVATAR);
    const objBelowAvatarList = tilemaps.filter(({ zIndex }) => zIndex === NEW_LAYERS.OBJ_BELOW_AVATAR);

    const groupsAboveAvatar = groupTilemaps(objAboveAvatarList, tilemaps);
    const groupsBelowAvatar = groupTilemaps(objBelowAvatarList, tilemaps);

    const compositeAboveAvatar = compositeIamges(groupsAboveAvatar);
    const compositeBelowAvatar = compositeIamges(groupsBelowAvatar);

    compositeIamges(groupsBelowAvatar);
    console.log("物件（遮挡人）", objAboveAvatarList);
    console.log("物件（遮挡人）分组", groupsAboveAvatar);
    console.log("物件（不遮挡人）", objBelowAvatarList);
    console.log("分组（不遮挡人）分组", groupsBelowAvatar);

    console.log("物件（不遮挡人）", compositeBelowAvatar);
    console.log("分组（不遮挡人）分组", compositeAboveAvatar);

    const images = this.store.images;
    // 过滤掉没有内容的文字（由于文字工具实现的有些问题，导致产生了没有内容的文字）
    const texts = this.store.texts.filter(({ content }) => content != null && content !== '');
    return {
      objects: this.store.objects,
      tilemaps,
      images,
      texts,
      compositeAboveAvatar,
      compositeBelowAvatar,
    };
  }

  addTilemap({ tileInfo, left, top }) {  
    const { element, isbirth, isCollider, zIndex, width, height } = tileInfo;
    const canCreate = this.canCreateTilemap({ isbirth, isCollider, zIndex, left, top, width, height });
    if (!canCreate) return;

    // 地板单独处理
    if (zIndex === NEW_LAYERS.GROUND) {
      this.addOrReplaceFloor({ tileInfo, left, top });
      return;
    }

    // 物件单独处理
    if (zIndex === NEW_LAYERS.OBJ_ABOVE_AVATAR || zIndex === NEW_LAYERS.OBJ_BELOW_AVATAR) {
      // 跳过重叠检查
    } else {
      // 重叠不能放置
      const tilemap = this.store.findByZIndexRect({ zIndex, left, top, width, height });
      if (tilemap) {
        handleError(new Error('不能放置'));
        return false;
      }
    }
  
    const tilemap = new Tilemap({
      ...tileInfo,
      id: getUuid(),
      left,
      top,
    });
    this.store.addObject(tilemap);
    this.canvas.addTilemap({ ...tilemap, element });
    eventBus.emit('ui:selectObject', tilemap);
  }

  addOrReplaceFloor({ tileInfo, left, top }) {
    const { element, zIndex, width, height } = tileInfo;
    let tilemap = this.store.findByZIndexRect({ zIndex, left, top, width, height });
    if (tilemap) {
      this.store.removeObject(tilemap.id);
      this.canvas.removeObject(tilemap.id);
    }
    tilemap = new Tilemap({
      ...tileInfo,
      id: getUuid(),
      left,
      top,
    });
    this.store.addObject(tilemap);
    this.canvas.addTilemap({ ...tilemap, element });
  }

  updateTilemap(id, data) {
    const tilemap = this.store.getObject(id);
    data.zIndex = getZIndex(tilemap.userLayer, data.isMaskPlayer ?? tilemap.isMaskPlayer);
    const canUpdate = this.canUpdateTilemap({ ...tilemap, ...data });
    if (!canUpdate) {
      return false;
    }

    const { left, top } = data;
    const { zIndex, width, height,name} = tilemap;
    if (zIndex === NEW_LAYERS.OBJ_ABOVE_AVATAR || zIndex === NEW_LAYERS.OBJ_BELOW_AVATAR) {
      // 跳过重叠检查
    } else {

      const isTransferPoint = name === TileEffectType.TransferDoor;
      if(isTransferPoint){
        // 如果是传送门，目标位置不可是已放置的传送门地块，边缘地图，禁行区域地块，碰撞体的物件
        const canCreate = this.canCreateTransferPoint({ left, top });
        if (!canCreate) {
          return false;
        }
        // const params = {
        //   tileInfo:this.tileInfo,
        //   point:point.snapToGrid(),
        // }
        // eventBus.emit('ui:showSelectSpaceMessage',params);
        // return false
      }

      // 重叠不能放置
      const tilemap = this.store.findByZIndexRect({ zIndex, left, top, width, height });
      if (tilemap) {
        handleError(new Error('不能放置'));
        return false;
      }
    }
    
    this.store.updateObject(id, data);
    const newTilemap = this.store.getObject(id);
    this.canvas.updateObject({ ...newTilemap });
    eventBus.emit('ui:updateObject', newTilemap);
    return true;
  }

  // 返回false表示中断操作，返回true不中断
  removeByRectZIndexList(rect, zIndexList) {
    const object = this.store.findByRect(rect, zIndexList);
    if (object == null) return true;

    if (object.__typename === OBJECT_TYPE.TILEMAP && object.interactiveType) {
      this.canRemoveTilemap(object.id).then((result) => {
        if (result) {
          this.removeObject(object.id);
        }
      });
      return false;
    }

    this.removeObject(object.id);
    return true;
  }

  addText(data) {
    const { left, top } = data;
    const point = new Offset(left, top);
    if (this.isPointOutOfRange(point)) {
      handleError(new Error('不能放置'));
      return;
    }

    const userLayer = USER_LAYER.FREE_OBJ;
    const isMaskPlayer = true;
    const zIndex = getZIndex(userLayer, isMaskPlayer);
    const fontSize = 24;
    const text = new Text({
      id: getUuid(),
      zIndex,
      left,
      top,
      width: 100,
      height: fontSize * DEFAULT_LINE_HEIGHT,
      userLayer,
      isMaskPlayer,
      content: '',
      fontSize,
      color: '#000',
      opacity: 1,
      isItalic: false,
      isBold: false,
      isUnderline: false,
      horizontalAlign: TextAlign.left,
      lineHeight: null,
      angle: 0,
    });
    this.store.addObject(text);
    this.canvas.addText(text);
    eventBus.emit('ui:useSelectTool', text.id);
    this.selectObject(text.id);
    this.canvas.enterEditing(text.id);
  }

  updateText(id, data) {
    if (!this.canUpdateText({ id, data })) {
      return false;
    }

    const text = this.store.getObject(id);
    data.zIndex = getZIndex(text.userLayer, data.isMaskPlayer ?? text.isMaskPlayer);
    this.store.updateObject(id, data);
    const newText = this.store.getObject(id);
    this.canvas.updateObject({ ...newText });
    eventBus.emit('ui:updateObject', newText);
    return true;
  }

  async addImage({ imageInfo, left, top }) {
    const { element, id, imageURL, width, height, imageWidth, imageHeight, name } = imageInfo;
    const userLayer = USER_LAYER.FREE_OBJ;
    const isMaskPlayer = true;
    const zIndex = getZIndex(userLayer, isMaskPlayer);
    const image = new Image({
      id: getUuid(),
      materialId: id,
      imageURL,
      left,
      top,
      width,
      height,
      imageWidth,
      imageHeight,
      name,
      userLayer,
      isMaskPlayer,
      zIndex,
      angle: 0,
      isBackgroundImage: false,
    });
    const rect = Rect.fromLTWH(image.left, image.top, image.width, image.height);
    const newRect = this.limitRectInMap(rect);
    image.left = newRect.left;
    image.top = newRect.top;
    image.width = newRect.width;
    image.height = newRect.height;
    this.store.addObject(image);
    this.canvas.addImage({ ...image, element });
    eventBus.emit('ui:useSelectTool', image.id);
    this.selectObject(image.id);
  }

  // 如果图片不全在地图里面，左上角对齐，若还不全在地图里面，缩小
  limitRectInMap(rect) {
    if (this.mapRect.containRect(rect)) return rect;

    const left = 0;
    const top = 0;
    const scaleX = this.mapRect.width / rect.width;
    const scaleY = this.mapRect.height / rect.height;
    const scale = Math.min(scaleX, scaleY, 1);
    const width = rect.width * scale;
    const height = rect.height * scale;
    return Rect.fromLTWH(left, top, width, height);
  }

  updateImage(id, data) {
    if (!this.canUpdateImage({ id, data })) {
      return false;
    }
    
    const image = this.store.getObject(id);
    data.zIndex = getZIndex(image.userLayer, data.isMaskPlayer ?? image.isMaskPlayer);
    this.store.updateObject(id, data);
    const newImage = this.store.getObject(id);
    this.canvas.updateObject({ ...newImage });
    eventBus.emit('ui:updateObject', newImage);
    return true;
  }

  hasBackground() {
    return this.store.objects.some(({ __typename }) => __typename === OBJECT_TYPE.BACKGROUND);
  }

  async addBackground(background) {
    if (this.hasBackground()) return;

    const rect = Rect.fromLTWH(background.left, background.top, background.width, background.height);
    const newRect = this.limitRectInMap(rect);
    background.left = newRect.left;
    background.top = newRect.top;
    background.width = newRect.width;
    background.height = newRect.height;

    const element = createCrossOriginImage(background.imageURL);
    try {
      await new Promise((resolve, reject) => {
        element.onload = () => {
          resolve();
        };
        element.onerror = (e) => {
          reject(e);
        };
      });
      this.store.addObject(background);
      this.canvas.addBackground({ ...background, element });
    } catch (err) {
      ElMessageBox.alert(
        '添加背景图失败。你可在左侧导航栏>贴图>个人素材中点击“背景图”重新添加',
        '操作提示',
        {
          confirmButtonText: "知道了",
          showClose: false,
          customClass: MESSAGE_BOX_CUSTOM_CLASS,
          modalClass: OVERLAY_CUSTOM_CLASS,
        },
      );
    }
  }

  async replaceBackground(background) {
    this.removeBackground();
    await this.addBackground(background);
  }

  updateBackground(id, data) {
    const background = this.store.objects.find((obj) => obj.id === id);
    if (background == null) return fasle;

    const rect = Rect.fromLTWH(data.left, data.top, data.width ?? background.width, data.height ?? background.height);
    const { top, left, width, height } = this.limitRectInMap(rect);
    this.store.updateObject(id, { top, left, width, height });
    const newBackground = this.store.getObject(id);
    this.canvas.updateObject({ ...newBackground });
    eventBus.emit('ui:updateObject', newBackground);
    return true;
  }

  removeBackground() {
    const background = this.store.objects.find(({ __typename }) => __typename === OBJECT_TYPE.BACKGROUND);
    if (background == null) return;

    this.store.removeObject(background.id);
    this.canvas.removeObject(background.id);
  }

  async canRemoveTilemap(id) {
    const tilemapToRemove = this.store.getObject(id);
    if (tilemapToRemove.interactiveType) {
      try {
        await ElMessageBox.confirm(
          '该物件带有可交互属性哦，删除该物件，可交互物中的文件、链接、文字等将被清除且无法恢复。确定要删除吗？',
          '操作提示',
          {
            confirmButtonText: '取消',
            cancelButtonText: '继续删除',
            type: 'warning',
            distinguishCancelAndClose: true,
            customClass: MESSAGE_BOX_CUSTOM_CLASS,
            modalClass: OVERLAY_CUSTOM_CLASS,
          },
        );
        // 取消
        return false;
      } catch (action) {
        if (action === 'cancel') {
          // 继续删除
          return true;
        } else {
          // 关闭
          return false;
        }
      }
    }
    return true;
  }

  removeObject(id) {
    const objectToRemove = this.store.getObject(id);
    this.store.removeObject(id);
    this.canvas.removeObject(id);
    if (objectToRemove.isbirth) {
      eventBus.emit('ui:enableBirthPoint');
    }
  }

  batchAddOrReplaceFloor(tileInfo, rect) {
    // 要求设计给到的地板素材都是1*1格规格的
    for (let left = rect.left; left < rect.right; left += CELL_WIDTH) {
      for (let top = rect.top; top < rect.bottom; top += CELL_HEIGHT) {
        this.addOrReplaceFloor({ tileInfo, left, top });
      }
    }
  }

  // 返回值true表示【可以】继续创建地块效果，返回值false表示【停止】继续创建地块效果
  addEffect(tileInfo, point) {
    const { element } = tileInfo;
    const { left, top } = point;
    const effects = this.store.findAllByZIndexPoint({ zIndex: NEW_LAYERS.FLAG_OBJ, left, top });
    const isBirthPoint = tileInfo.isbirth;
    const isColliderPoint = tileInfo.name === TileEffectType.Impassable;

    if (isBirthPoint) {
      // 1. 自己是出生点，地图已经有出生点|位置在地图边缘｜位置有碰撞物件或碰撞格子，提示，停止新建
      const canCreate = this.canCreateBirthPoint({ left, top });
      if (!canCreate) {
        return false;
      }
    } else if (isColliderPoint) {
      const hasEffects = effects.length > 0;
      if (hasEffects) {
        const hasOtherEffects = effects.some((effect) => effect.name !== TileEffectType.Impassable);
        if (hasOtherEffects) {
          // 2. 自己是碰撞格子，目标位置有其他地块效果，提示，停止新建
          handleError(new Error('禁行区域不可与其他地块效果重叠哦'));
          return false;
        } else {
          // 3. 自己是碰撞格子，目标位置有碰撞格子，不提示，跳过，不停止新建
          return true;
        }
      }
    }

    const tilemap = new Tilemap({
      ...tileInfo,
      id: getUuid(),
      left,
      top,
    });
    this.store.addObject(tilemap);
    this.canvas.addTilemap({ ...tilemap, element });
    if (tilemap.isbirth) {
      // TODO: 可能放在store层比较好
      eventBus.emit('ui:disableBirthPoint');
    }
    return true;
  }

  addOrReplaceWall(tileInfo, point) {
    const { element, width, height } = tileInfo;
    const { left, top } = point;
    const zIndexList = [NEW_LAYERS.WALL_FRONT, NEW_LAYERS.WALL_BEHIND];
    let tilemap = this.store.findByRect({ left, top, width, height }, zIndexList);
    if (tilemap) {
      this.store.removeObject(tilemap.id);
      this.canvas.removeObject(tilemap.id);
    }
    tilemap = new Tilemap({
      ...tileInfo,
      id: getUuid(),
      left,
      top,
    });
    this.store.addObject(tilemap);
    this.canvas.addTilemap({ ...tilemap, element });
  }

  selectObject(id) {
    const object = this.store.getObject(id);
    this.canvas.selectObject(id);
    eventBus.emit('ui:selectObject', object);

    const mode = getModeByZIndex(object.zIndex);
    eventBus.emit('ui:changeMode', mode);
  }

  unselectObject() {
    this.canvas.unselectObject();
    eventBus.emit('ui:unselectObject');
  }

  selectObjectAndOpenContextMenu(id, clientX, clientY) {
    this.selectObject(id);
    const object = this.store.getObject(id);
    const { zIndex, left, top, width, height, angle } = object;
    const objectList = this.store.findAllByZIndexRect({ zIndex, left, top, width, height, angle });
    eventBus.emit('ui:openContextMenu', { clientX, clientY, object, objectList });
  }

  unselectObjectAndCloseContextMenu() {
    this.unselectObject();
    eventBus.emit('ui:closeContextMenu');
  }

  moveAbove(id, targetId) {
    this.store.moveAbove(id, targetId);
    this.canvas.moveAbove(id, targetId);
  }

  moveBelow(id, targetId) {
    this.store.moveBelow(id, targetId);
    this.canvas.moveBelow(id, targetId);
  }

  getTilemapId({ zIndex, left, top }) {
    const tilemap = this.store.findByZIndexPoint({ zIndex, left, top });
    return tilemap?.id;
  }

  canUpdateText({ id, data }) {
    const text = this.store.getObject(id);
    const { left, top, width, height, angle } = { ...text, ...data };
    const { tl, tr, bl, br } = rotateRect({ left, top, width, height, angle }, fabric);
    const points = [tl, tr, bl, br].map(({ x, y }) => new Offset(x, y));
    const outOfRange = points.some((point) => this.isPointOutOfRange(point));
    if (outOfRange) {
      handleError(new Error('不能放置'));
      return false;
    }

    return true;
  }

  canUpdateImage({ id, data }) {
    const image = this.store.getObject(id);
    const { left, top, width, height, angle } = { ...image, ...data };
    const { tl, tr, bl, br } = rotateRect({ left, top, width, height, angle }, fabric);
    const points = [tl, tr, bl, br].map(({ x, y }) => new Offset(x, y));
    const outOfRange = points.some((point) => this.isPointOutOfRange(point));
    if (outOfRange) {
      handleError(new Error('不能放置'));
      return false;
    }

    return true;
  }

  canCreateTilemap({ isbirth, isCollider, left, top, width, height }) {
    const rect = Rect.fromLTWH(left, top, width, height);
    if (this.isRectOutOfRange(rect)) {
      handleError(new Error('不能放置'));
      return false;
    }

    // 如果位置有出生点，并且准备添加的物件是禁行区域，那么不能放置该物件
    for (let i = 0; i < layers.length; i++) {
      const zIndex = layers[i];
      const tilemap = this.store.findByZIndexRect({ zIndex, left, top, width, height });
      if (tilemap && tilemap.isbirth && isCollider) {
        handleError(new Error('不能放置'));
        return false;
      }
    }

    if (isbirth) {
      const canCreate = this.canCreateBirthPoint({ left, top });
      if (!canCreate) return false;
    }

    return true;
  }

  canUpdateTilemap({ id, isbirth, isCollider, zIndex, left, top, width, height, angle, interactiveType }) {
    const rect = Rect.fromLTWH(left, top, width, height);
    if (this.isRectOutOfRange(rect)) {
      handleError(new Error('不能放置'));
      return false;
    }

    // 如果位置有出生点或者禁行区域，并且准备添加的物件是禁行区域，那么不能放置该物件
    for (let i = 0; i < layers.length; i++) {
      const zIndex = layers[i];
      const tilemap = this.store.findByZIndexRect({ zIndex, left, top, width, height });
      if (tilemap && tilemap.isbirth && isCollider) {
        handleError(new Error('不能放置'));
        return false;
      }
    }

    if (isbirth) {
      const canUpdate = this.canUpdateBirthPoint({ id, left, top });
      if (!canUpdate) return false;
    }

    // 如果当前物件有可交互物并且（跨大层）重叠的物件中也有可交互物，那么不能放置该物件
    if (interactiveType) {
      let overlappedObjects = this.store.findAllByZIndexRect({ zIndex, left, top, width, height, angle });
      overlappedObjects = overlappedObjects.filter((obj) => obj.id !== id);
      const hasInteractive = overlappedObjects.some(({ interactiveType }) => interactiveType !== INTERACTIVE_TYPE.DEFAULT);
      if (hasInteractive) {
        ElMessageBox.alert(
          '添加了可交互属性的素材不可以重叠哦～',
          '操作提示',
          {
            confirmButtonText: '知道了',
            showClose: false,
            customClass: MESSAGE_BOX_CUSTOM_CLASS,
            modalClass: OVERLAY_CUSTOM_CLASS,
          },
        );
        return false;
      }
    }

    return true;
  }

  isRectOutOfRange(rect) {
    return !this.mapRect.containRect(rect);
  }

  isPointOutOfRange(point) {
    return !this.mapRect.containPoint(point);
  }

  limitLeft(left) {
    if (left < 0) return 0;
    const maxLeft = (this.width - 1) * CELL_WIDTH;
    if (left > maxLeft) return maxLeft;
    return left;
  }

  limitTop(top) {
    if (top < 0) return 0;
    const maxTop = this.height * CELL_HEIGHT;
    if (top > maxTop) return maxTop;
    return top;
  }

  canCreateBirthPoint({ left, top }) {
    if (this.hasBirthPoint()) {
      handleError(new Error('出生点只能是一个!'));
      return false;
    }
    const tileLeft = left / CELL_WIDTH;
    const tileTop = top / CELL_HEIGHT;
    if(tileLeft === 0
      || tileLeft === this.width
      || tileTop == 0
      || tileTop == this.height
    ) {
      handleError(new Error('出生点不能设置地图边缘!'));
      return false;
    }
  
    for(let i = 0; i < layers.length; i++) {
      const zIndex = layers[i];
      const id = this.getTilemapId({ zIndex, left, top });
      if (id) {
        const tilemap = this.store.getObject(id);
        if (tilemap?.isCollider) {
          handleError(new Error('出生点不可有碰撞物体'));
          return false;
        }
      }
    }

    return true;
  }

  canCreateTransferPoint({ left, top }){
    const tileLeft = left / CELL_WIDTH;
    const tileTop = top / CELL_HEIGHT;
    const effects = this.store.findAllByZIndexPoint({ zIndex: NEW_LAYERS.FLAG_OBJ, left, top });
    if(tileLeft === 0
      || tileLeft === this.width
      || tileTop == 0
      || tileTop == this.height
    ) {
      handleError(new Error('传送地块不能设置地图边缘!'));
      return false;
    }

    for(let i = 0; i < layers.length; i++) {
      const zIndex = layers[i];
      const id = this.getTilemapId({ zIndex, left, top });
      if (id) {
        const tilemap = this.store.getObject(id);
        if (tilemap?.isCollider) {
          handleError(new Error('传送地块不可与禁行区域或人物不可通过的物件重叠哦，如需更换传送地块，请删除后再添加'));
          return false;
        }
        if (tilemap?.name === TileEffectType.TransferDoor) {
          handleError(new Error('传送地块之间不可重叠哦，如需更换传送地块，请删除后再添加'));
          return false;
        }
      }
    }
    
    return true;
  }

  canUpdateBirthPoint({ id: birthPointId, left, top }) {
    const tileLeft = left / CELL_WIDTH;
    const tileTop = top / CELL_HEIGHT;
    if(tileLeft === 0
      || tileLeft === this.width
      || tileTop == 0
      || tileTop == this.height
    ) {
      handleError(new Error('出生点不能设置地图边缘!'));
      return false;
    }
  
    for(let i = 0; i < layers.length; i++) {
      const zIndex = layers[i];
      const id = this.getTilemapId({ zIndex, left, top });
      if (id && id !== birthPointId) {
        const tilemap = this.store.getObject(id);
        if (tilemap?.isCollider) {
          handleError(new Error('出生点不可有碰撞物体'));
          return false;
        }
      }
    }

    return true;
  }

  exportImage() {
    const selectedObjectId = this.canvas.getActiveObject()?.id;
    const { canvasWidth: lastCanvasWidth, canvasHeight: lastCanvasHeight } = this.canvas;
    const vpt = this.canvas.getViewportTransform();

    // 调整画布大小
    const { zoom, canvasWidth, canvasHeight } = this.getExportCanvasSizeAndZoom(this.width, this.height);
    this.canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
    // 缩放和偏移
    this.canvas.absolutePan({ x: 0, y: 0 });
    this.canvas.zoomToPoint({ x: 0, y: 0 }, zoom);
    // 取消选中
    this.canvas.unselectObject();
    // 移除格网
    this.canvas.removeGrid();
    // 清除背景色
    this.canvas.setBackgroundColor('');
    // 导出图片
    const dataUrl = this.canvas.toDataURL();
    // 还原画布大小
    this.canvas.setDimensions({ width: lastCanvasWidth, height: lastCanvasHeight });
    // 还原缩放和偏移
    this.canvas.setViewportTransform(vpt);
    // 还原背景色
    this.canvas.setBackgroundColor('#F1F4F7');
    // 还原格网
    this.canvas.addGrid({ width: this.width, height: this.height });
    // 还原选中
    this.canvas.selectObject(selectedObjectId);

    return dataUrl;
  }

  getExportCanvasSizeAndZoom(width, height) {
    const canvasWidth = width * CELL_WIDTH;
    const canvasHeight = height * CELL_HEIGHT;
    if (canvasWidth > MAX_CANVAS_SIZE || canvasHeight > MAX_CANVAS_SIZE) {
      let zoom;
      let newCanvasWidth;
      let newCanvasHeight;
      if (canvasWidth >= canvasHeight) {
          zoom = MAX_CANVAS_SIZE / canvasWidth;
          newCanvasWidth = MAX_CANVAS_SIZE;
          newCanvasHeight = canvasHeight * zoom;
      } else {
          zoom = MAX_CANVAS_SIZE / canvasHeight;
          newCanvasWidth = canvasWidth * zoom;
          newCanvasHeight = MAX_CANVAS_SIZE;
      }
      return {
        zoom,
        canvasWidth: newCanvasWidth,
        canvasHeight: newCanvasHeight,
      };
    } else {
      return {
        zoom: 1,
        canvasWidth,
        canvasHeight,
      };
    }
  }

  findByPoint(point) {
    const selectedMode = this.getMode();
    const zIndexList = getZIndexListByMode(selectedMode);
    return this.store.findByPoint(point, zIndexList);
  }

  canAddInteractive(object) {
    const { zIndex, left, top, width, height, angle } = object;
    const objectList = this.store.findAllByZIndexRect({ zIndex, left, top, width, height, angle });
    return !objectList.some(({ interactiveType }) => interactiveType !== INTERACTIVE_TYPE.DEFAULT);
  }
}

export default BusinessLogic;
