import { createCrossOriginImage, createPlaceholder } from "./util";
import { CELL_WIDTH, CELL_HEIGHT, OBJECT_TYPE, NEW_LAYERS } from './const';
import eventBus from './eventBus';
import {
  getCustomControls,
  getCustomBackgroundControls,
  getCustomTextControls,
  customOptions,
  customTileOptions,
  customTextOptions,
} from "./custom";
import { convertBackgroundToCanvasBackground, convertImageToCanvasImage, convertTextToCanvasText, convertTilemapToCanvasTilemap } from './convert';

const LINE_STROKE_COLOR = '#CFCFCF';
const TILE_EFFECT_MASK_ID = 'TILE_EFFECT_MASK';
const GRID_ZINDEX = 100;

class MapCanvas {
  constructor({
    // 地图宽度，单位：格子
    width,
    // 地图高度，单位：格子
    height,
    canvasElem,
    canvasWidth,
    canvasHeight,
  }) {
    this.width = width;
    this.height = height;
    this.canvasElem = canvasElem;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  initialize() {
    // 配置自定义图片的控件
    this.customControls = getCustomControls(fabric);
    this.customBackgroundControls = getCustomBackgroundControls(fabric);
    this.customTextControls = getCustomTextControls(fabric);
    
    this.canvas = new fabric.Canvas(this.canvasElem, {
      width: this.canvasWidth,
      height: this.canvasHeight,
      // 右键不弹出浏览器默认的上下文菜单
      stopContextMenu: true,
      // 对象选中时保持在栈中的位置不变，不移动至栈顶
      preserveObjectStacking: true,
      hoverCursor: 'default',
      backgroundColor: '#F1F4F7',
    });
    this.canvas.renderAll();

    this.proxyCanvasEvents();

    this.interactiveNotSaved = false;
    this.handleInteractiveNotSavedChange = this.handleInteractiveNotSavedChange.bind(this);
    eventBus.on('ui:interactiveNotSavedChange', this.handleInteractiveNotSavedChange);

    eventBus.emit('canvas:initialized', { canvas: this });
  }

  dispose() {
    eventBus.off('ui:interactiveNotSavedChange', this.handleInteractiveNotSavedChange);
    this.unproxyCanvasEvents();
    this.canvas.off();
    this.canvas.dispose();
    this.canvas = null;
  }

  handleInteractiveNotSavedChange(interactiveNotSaved) {
    this.interactiveNotSaved = interactiveNotSaved;
  }

  proxyCanvasEvents() {
    this.handleMouseDown = (e) => {
      // 如果可交互物未保存，需要弹窗提示，阻断画布的mousedown事件
      if (this.interactiveNotSaved) return;

      this.canvas.selection = true;
      eventBus.emit('canvas:mouseDown', this.translateEvent(e));
    };
    this.handleMouseMove = (e) => {
      eventBus.emit('canvas:mouseMove', this.translateEvent(e));
    };
    this.handleMouseUp = (e) => {
      this.canvas.selection = false;
      eventBus.emit('canvas:mouseUp', this.translateEvent(e));
    };
    this.handleMouseWheel = (e) => {
      eventBus.emit('canvas:mouseWheel', this.translateEvent(e));
    };
    this.handleDragEnter = (e) => {
      eventBus.emit('canvas:dragenter', this.translateDragEvent(e));
    };
    this.handleDragOver = (e) => {
      eventBus.emit('canvas:dragover', this.translateDragEvent(e));
    };
    this.handleDragLeave = (e) => {
      eventBus.emit('canvas:dragleave', this.translateDragEvent(e));
    };
    this.handleDrop = (e) => {
      eventBus.emit('canvas:drop', this.translateDragEvent(e));
    };
    this.handleObjectAdded = (e) => {
      eventBus.emit('canvas:objectAdded', e.target);
    };
    this.handleObjectModified = (e) => {
      eventBus.emit('canvas:objectModified', e);
    };
    this.handleSelectionCreated = (e) => {
      eventBus.emit('canvas:objectSelected', e.selected[0]);
    };
    this.handleSelectionUpdated = (e) => {
      eventBus.emit('canvas:objectUnselected');
      eventBus.emit('canvas:objectSelected', e.selected[0]);
    };
    this.handleSelectionCleared = (e) => {
      eventBus.emit('canvas:objectUnselected');
    };
    this.handleTextEditingEntered = (e) => {
      eventBus.emit('canvas:textEditingEntered', e.target);
    };
    this.handleTextEditingExited = (e) => {
      eventBus.emit('canvas:textEditingExited', e.target);
    };
    this.handleTextChanged = (e) => {
      eventBus.emit('canvas:textChanged', e.target);
    };
    this.handleContextMenu = (e) => {
      eventBus.emit('canvas:contextMenu', e);
    };

    this.canvas.on('mouse:down', this.handleMouseDown);
    this.canvas.on('mouse:move', this.handleMouseMove);
    this.canvas.on('mouse:up', this.handleMouseUp);
    this.canvas.on('mouse:wheel', this.handleMouseWheel);
    this.canvas.on('dragenter', this.handleDragEnter);
    this.canvas.on('dragover', this.handleDragOver);
    this.canvas.on('dragleave', this.handleDragLeave);
    this.canvas.on('drop', this.handleDrop);
    this.canvas.on('object:added', this.handleObjectAdded);
    this.canvas.on('object:modified', this.handleObjectModified);
    this.canvas.on('selection:created', this.handleSelectionCreated);
    this.canvas.on('selection:updated', this.handleSelectionUpdated);
    this.canvas.on('selection:cleared', this.handleSelectionCleared);
    this.canvas.on('text:editing:entered', this.handleTextEditingEntered);
    this.canvas.on('text:editing:exited', this.handleTextEditingExited);
    this.canvas.on('text:changed', this.handleTextChanged);
    this.canvas.upperCanvasEl.addEventListener('contextmenu', this.handleContextMenu);
  }

  unproxyCanvasEvents() {
    this.canvas.off('mouse:down', this.handleMouseDown);
    this.canvas.off('mouse:move', this.handleMouseMove);
    this.canvas.off('mouse:up', this.handleMouseUp);
    this.canvas.off('mouse:wheel', this.handleMouseWheel);
    this.canvas.off('object:added', this.handleObjectAdded);
    this.canvas.off('object:modified', this.handleObjectModified);
    this.canvas.off('selection:created', this.handleSelectionCreated);
    this.canvas.off('selection:updated', this.handleSelectionUpdated);
    this.canvas.off('selection:cleared', this.handleSelectionCleared);
    this.canvas.off('text:editing:entered', this.handleTextEditingEntered);
    this.canvas.off('text:editing:exited', this.handleTextEditingExited);
    this.canvas.off('text:changed', this.handleTextChanged);
    this.canvas.upperCanvasEl.removeEventListener('contextmenu', this.handleContextMenu);
  }

  addGrid(data) {
    const { width, height } = data;
    // 通过画线的方式生成网格
    for (var i = 0; i <= height; i++) {
      this.addLine([0, i * CELL_HEIGHT, width * CELL_WIDTH, i * CELL_HEIGHT]);
    }
    for (var i = 0; i <= width; i++) {
      this.addLine([i * CELL_WIDTH, 0, i * CELL_WIDTH, height * CELL_HEIGHT]);
    }
    // 绘制白色背景矩形
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: CELL_WIDTH * width,
      height: CELL_HEIGHT * height,
      fill: '#fff',
      selectable: false,
    });
    this.canvas.insertAt(rect, 0);
  }

  // points: [x1, y1, x2, y2]
  addLine(points) {
    const newPoints = points.map((v) => v - 0.5);
    const line = new fabric.Line(newPoints, {
      stroke: LINE_STROKE_COLOR,
      selectable: false,
      zIndex: GRID_ZINDEX,
    });
    // 格网在 fabric.Canvas() 中除了悬浮物件层级最高
    this.canvas.add(line);
  }

  removeGrid() {
    this.canvas.forEachObject((obj) => {
      if (obj.type === 'rect' || obj.type === 'line') {
        this.canvas.remove(obj);
      }
    });
  }

  addEffectMask() {
    const mask = new fabric.Rect({
      id: TILE_EFFECT_MASK_ID,
      left: 0,
      top: 0,
      width: this.canvasWidth,
      height: this.canvasHeight,
      selectable: false,
      fill: '#282C4A',
      opacity: 0.3,
    });
    this.transformEffectMask(mask);
    const index = this.canvas.getObjects().findIndex((obj) => obj.zIndex > NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR);
    this.canvas.insertAt(mask, index);
  }

  updateEffectMask() {
    const mask = this.canvas.getObjects().find(({ id }) => id === TILE_EFFECT_MASK_ID);
    if (mask == null) return;

    this.transformEffectMask(mask);
    this.canvas.renderAll();
  }

  // tranform遮罩层，使得它和画布完全重叠
  transformEffectMask(mask) {
    const { invertTransform, qrDecompose } = fabric.util;
    const mCanvas = this.canvas.viewportTransform;
    const mCanvasInvert = invertTransform(mCanvas);
    const { scaleX, scaleY, translateX, translateY } = qrDecompose(mCanvasInvert);
    mask.set({
      scaleX,
      scaleY,
      left: translateX,
      top: translateY,
      width: this.canvasWidth,
      height: this.canvasHeight,
    });
  }

  removeEffectMask() {
    const mask = this.canvas.getObjects().find(({ id }) => id === TILE_EFFECT_MASK_ID);
    if (mask == null) return;

    this.canvas.remove(mask);
  }

  setBackgroundColor(color) {
    this.canvas.backgroundColor = color;
  }

  restore(objects) {
    return Promise.all(
      objects.map((obj) => {
        if (obj.__typename === OBJECT_TYPE.BACKGROUND) {
          return this.createBackground(obj);
        } else if (obj.zIndex === NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR || obj.zIndex === NEW_LAYERS.FREE_OBJ_BELOW_AVATAR) {
          if (obj.__typename === OBJECT_TYPE.IMAGE) {
            return this.createImage(obj);
          } else {
            return Promise.resolve(this.createText(obj));
          }
        } else if (obj.zIndex === NEW_LAYERS.FLAG_OBJ) {
          return this.createTilemap({ ...obj, opacity: 0 });
        } else {
          return this.createTilemap(obj);
        }
      })
    ).then((objects) => {
      objects.forEach((obj) => {
        this.addObject(obj);
      });
    });
  }

  setDimensions({ width, height }) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvas.setDimensions({ width, height });
    this.canvas.renderAll();
    this.updateEffectMask();
  }

  addTilemap(data) {
    const { __typename, id, element, zIndex, left, top, width, height, opacity = 1 } = data;
    const tilemap = new fabric.Image(element, {
      __typename,
      id,
      zIndex,
      left,
      top,
      width,
      height,
      opacity,
      selectable: false,
      crossOrigin: 'anonymous',
      lockMovementY: true,
      lockMovementX: true,
      hasControls: false,
      ...customTileOptions,
    });
    this.addObject(tilemap);
  }

  createTilemap(data) {
    const { __typename, id, imageURL, zIndex, left, top, width, height, opacity = 1 } = data;
    return new Promise((resolve, reject) => {
      const imgElem = createCrossOriginImage(imageURL);
  
      imgElem.onload = () => {
        const tilemap = new fabric.Image(imgElem, {
          __typename,
          id,
          imageURL,
          zIndex,
          left,
          top,
          width,
          height,
          opacity,
          selectable: false,
          crossOrigin: 'anonymous',
          lockMovementY: true,
          lockMovementX: true,
          hasControls: false,
          ...customTileOptions,
        });
        resolve(tilemap);
      };
  
      imgElem.onerror = (error) => {
        console.error(error);
        createPlaceholder(width, height).then((obj) => {
          fabric.Image.fromObject(obj, (tilemap) => {
            tilemap.set({
              __typename,
              imageNotFound: true,
              id,
              imageURL,
              zIndex,
              left,
              top,
              width,
              height,
              opacity,
              selectable: false,
              crossOrigin: 'anonymous',
              lockMovementY: true,
              lockMovementX: true,
              hasControls: false,
              ...customTileOptions,
            });
            resolve(tilemap);
          });
        }).catch(() => {
          reject(error);
        });
      };
    });
  }

  createImage(data) {
    const { opacity = 1, ...dataToKeep } = data;
    const imageData = convertImageToCanvasImage(dataToKeep);
    return new Promise((resolve, reject) => {
      const imgElem = createCrossOriginImage(imageData.imageURL);
      imgElem.onload = () => {
        const image = new fabric.Image(imgElem, {
          ...imageData,
          opacity,
          selectable: false,
          crossOrigin: 'anonymous',
          lockMovementY: true,
          lockMovementX: true,
          controls: this.customControls,
          ...customOptions,
        });
        resolve(image);
      };
  
      imgElem.onerror = (error) => {
        console.error(error);
        const { width, height } = imageData;
        createPlaceholder(width, height).then((obj) => {
          fabric.Image.fromObject(obj, (image) => {
            image.set({
              imageNotFound: true,
              ...imageData,
              opacity,
              selectable: false,
              crossOrigin: 'anonymous',
              lockMovementY: true,
              lockMovementX: true,
              controls: this.customControls,
              ...customOptions,
            });
            resolve(image);
          });
        }).catch(() => {
          reject(error);
        });
      };
    });
  }

  addImage(data) {
    const { element, opacity = 1, ...dataToKeep } = data;
    const imageData = convertImageToCanvasImage(dataToKeep);
    const image = new fabric.Image(element, {
      ...imageData,
      selectable: false,
      crossOrigin: 'anonymous',
      lockMovementY: true,
      lockMovementX: true,
      controls: this.customControls,
      ...customOptions,
    });
    this.addObject(image);
  }

  createBackground(data) {
    const backgroundData = convertImageToCanvasImage(data);
    return new Promise((resolve, reject) => {
      const imgElem = createCrossOriginImage(backgroundData.imageURL);
      imgElem.onload = () => {
        const background = new fabric.Image(imgElem, {
          ...backgroundData,
          selectable: false,
          crossOrigin: 'anonymous',
          lockMovementY: true,
          lockMovementX: true,
          controls: this.customBackgroundControls,
          ...customOptions,
        });
        resolve(background);
      };
      imgElem.onerror = (error) => {
        console.error(error);
        const { width, height } = backgroundData;
        createPlaceholder(width, height).then((obj) => {
          fabric.Image.fromObject(obj, (background) => {
            background.set({
              imageNotFound: true,
              ...backgroundData,
              selectable: false,
              crossOrigin: 'anonymous',
              lockMovementY: true,
              lockMovementX: true,
              controls: this.customBackgroundControls,
              ...customOptions,
            });
            resolve(background);
          });
        }).catch(() => {
          reject(error);
        });
      };
    });
  }

  addBackground(data) {
    const { element, ...dataToKeep } = data;
    const imageData = convertImageToCanvasImage(dataToKeep);
    const background = new fabric.Image(element, {
      ...imageData,
      selectable: false,
      crossOrigin: 'anonymous',
      lockMovementY: true,
      lockMovementX: true,
      controls: this.customBackgroundControls,
      ...customOptions,
    });
    this.addObject(background);
  }

  addText(data) {
    const text = this.createText(data);
    this.addObject(text);
  }

  createText(data) {
    const textData = convertTextToCanvasText(data);
    const text = new fabric.Textbox(textData.text, {
      ...textData,
      strokeWidth: 0,
      selectable: false,
      lockMovementY: true,
      lockMovementX: true,
      controls: this.customTextControls,
      ...customTextOptions,
    });
    return text;
  }

  addObject(object) {
    const index = this.canvas.getObjects().findIndex((obj) => obj.zIndex > object.zIndex);
    if (index === -1) {
      this.canvas.add(object);
    } else {
      this.canvas.insertAt(object, index);
    }
  }

  async updateObject(data, render = true) {
    const object = this.getObject(data.id);
    if (object == null) return;

    // 层级发生变化，维护层级
    if (data.zIndex && data.zIndex !== object.zIndex) {
      const indexOfUpperLayerLowest = this.canvas.getObjects().findIndex((obj) => obj.zIndex > data.zIndex);
      if (indexOfUpperLayerLowest === -1) {
        object.bringToFront();
      } else {
        // TODO: 解释这里为什么这么做
        if (data.zIndex > object.zIndex) {
          const indexOfCurrentLayerHighest = indexOfUpperLayerLowest - 1;
          object.moveTo(indexOfCurrentLayerHighest);
        } else {
          object.moveTo(indexOfUpperLayerLowest);
        }
      }
    }

    // TODO: 不应该把这些逻辑写在这里
    if (data.__typename === OBJECT_TYPE.TILEMAP) {
      data = convertTilemapToCanvasTilemap(data);
      if (data.imageURL !== object.imageURL) {
        object.setSrc(data.imageURL, () => {
          object.set(data);
          object.setCoords();
          this.canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
        return;
      }
    } else if (data.__typename === OBJECT_TYPE.TEXT) {
      data = convertTextToCanvasText(data);
    } else if (data.__typename === OBJECT_TYPE.IMAGE) {
      data = convertImageToCanvasImage(data);
    } else if (data.__typename === OBJECT_TYPE.BACKGROUND) {
      data = convertBackgroundToCanvasBackground(data);
    }

    object.set(data);
    object.setCoords();
    if (render) {
      this.canvas.renderAll();
    }
  }

  getObject(id) {
    if (id == null) return null;
    return this.canvas.getObjects().find((obj) => obj.id === id);  
  }

  removeObject(id) {
    const object = this.getObject(id);
    if (object == null) return;

    this.canvas.remove(object);
  }

  getActiveObject() {
    return this.canvas.getActiveObject();
  }

  selectObject(id) {
    const object = this.getObject(id);
    if (object == null) return;

    this.canvas.setActiveObject(object).renderAll();
  }

  unselectObject() {
    this.canvas.discardActiveObject().renderAll();
  }

  toDataURL() {
    return this.canvas.toDataURL();
  }

  relativePan(point) {
    this.restartCursorImmediately();
    this.canvas.relativePan(point);
    this.updateEffectMask();
  }

  absolutePan(point) {
    this.restartCursorImmediately();
    this.canvas.absolutePan(point);
    this.updateEffectMask();
  }

  zoomToPoint(point, zoom) {
    this.restartCursorImmediately();
    this.canvas.zoomToPoint(point, zoom);
    this.updateEffectMask();
  }

  // 即时刷新文本框的cursor，避免在缩放或移动时cursor在画布上重复绘制，污染画布
  restartCursorImmediately() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.isEditing) {
      activeObject.initDelayedCursor(true);
    }
  }

  enableSelection() {
    this.canvas.selection = true;
  }

  disableSelection() {
    this.canvas.selection = false;
  }

  setDefaultCursor(defaultCursor) {
    this.canvas.defaultCursor = defaultCursor;
  }

  setHoverCursor(hoverCursor) {
    this.canvas.hoverCursor = hoverCursor;
  }

  enterEditing(id) {
    const object = this.getObject(id);
    if (object == null) return;
    if (object.__typename !== OBJECT_TYPE.TEXT) return;

    object.enterEditing();
  }

  exitEditing(id) {
    const object = this.getObject(id);
    if (object == null) return;

    object.exitEditing();
  }

  getViewportTransform() {
    return this.canvas.viewportTransform;
  }

  setViewportTransform(viewportTransform) {
    this.canvas.setViewportTransform(viewportTransform);
  }

  renderAll() {
    this.canvas.renderAll();
  }

  moveAbove(id, targetId) {
    const object = this.getObject(id);
    const targetIndex = this.canvas.getObjects().findIndex((obj) => obj.id === targetId);
    object.moveTo(targetIndex);
  }

  moveBelow(id, targetId) {
    const object = this.getObject(id);
    const targetIndex = this.canvas.getObjects().findIndex((obj) => obj.id === targetId);
    object.moveTo(targetIndex);
  }

  getObjects() {
    return this.canvas.getObjects();
  }

  // 工具函数
  translateEvent(e) {
    return {
      ...e,
      zoom: this.canvas.getZoom(),
    };
  }

  translateDragEvent(e) {
    const { x: left, y: top } = this.canvas.getPointer(e.e);
    return {
      ...e,
      left,
      top,
    };
  }
}

export default MapCanvas;
