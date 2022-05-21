import eventBus from '../eventBus';
import { FLOAT_OBJECT_OPACITY, HOVER_TILE_EFFECT_OPACITY, NEW_LAYERS, OBJECT_TYPE, TILE_EFFECT_OPACITY } from '../const';
import { Offset, Rect } from '../model';

class ToolEdit {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;

    this.selectedObject = null;
    this.objectStartLeft = null;
    this.objectStartTop = null;

    this.panning = false;
    this.startLeft = null;
    this.startTop = null;
    this.movePoint = null;
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
    this.ctrlKeyDown = false;
  }

  register({ zIndexList, selectedObjectId }) {
    console.log('注册编辑工具', this);
    this.zIndexList = zIndexList;
    this.selectedObject = this.canvas.getObject(selectedObjectId);
    
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleObjectModified = this.handleObjectModified.bind(this);
    this.handleTextEditingExited = this.handleTextEditingExited.bind(this);
    this.handleTextChanged = this.handleTextChanged.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    
    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:mouseUp', this.handleMouseUp);
    eventBus.on('canvas:objectModified', this.handleObjectModified);
    eventBus.on('canvas:textEditingExited', this.handleTextEditingExited);
    eventBus.on('canvas:textChanged', this.handleTextChanged);
    eventBus.on('canvas:contextMenu', this.handleContextMenu);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  unregister() {
    console.log('取消注册编辑工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);
    eventBus.off('canvas:objectModified', this.handleObjectModified);
    eventBus.off('canvas:textEditingExited', this.handleTextEditingExited);
    eventBus.off('canvas:textChanged', this.handleTextChanged);
    eventBus.off('canvas:contextMenu', this.handleContextMenu);
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.selectedObject) {
      this.businessLogic.unselectObject();
    }

    this.clear();
  }

  handleMouseDown(e) {
    if (e.e.ctrlKey) {
      this.ctrlKeyDown = true;
      // 避免ctrl鼠标左键拖动画布导致选中的物件丢失选中状态
      if (this.selectedObject) {
        this.businessLogic.selectObject(this.selectedObject.id);
      }
      return;
    }

    // 点击到选中物体的锚点，即点击到选中物体。不再继续判定后续的自定义选中逻辑
    if (this.selectedObject && e.target === this.selectedObject && e.transform && e.transform.action !== 'drag') {
      return;
    }

    const { absolutePointer } = e;
    this.panning = true;

    const point = new Offset(absolutePointer.x, absolutePointer.y);
    const object = this.businessLogic.findByPoint(point);
    debugger
    if (object) {
      const canvasObject = this.canvas.getObject(object.id);
      this.businessLogic.selectObject(canvasObject.id);
      this.selectedObject = canvasObject;
      this.objectStartLeft = canvasObject.left;
      this.objectStartTop = canvasObject.top;
    } else {
      this.businessLogic.unselectObject();
      this.selectedObject = null;
    }

    if (object == null) {
      this.clear();
      return;
    }

    const canvasObject = this.canvas.getObject(object.id);
    if (object.__typename === OBJECT_TYPE.TEXT && canvasObject.isEditing) {
      this.clear();
      return;
    }

    if (object.__typename === OBJECT_TYPE.TILEMAP) {
      const { left, top } = point.snapToGrid();
      this.startLeft = left;
      this.startTop = top;
      this.lastMoveLeft = left;
      this.lastMoveTop = top;
    } else {
      const { left, top } = point;
      this.startLeft = left;
      this.startTop = top;
    }
  }

  handleMouseMove(e) {
    if (e.e.ctrlKey && this.panning) return;

    if (!this.panning) return;
    
    const point = new Offset(e.absolutePointer.x, e.absolutePointer.y);    
    this.movePoint = point;
    const { __typename, zIndex } = this.selectedObject;
    const opacity = zIndex === NEW_LAYERS.FLAG_OBJ ? HOVER_TILE_EFFECT_OPACITY : FLOAT_OBJECT_OPACITY;
    if (__typename === OBJECT_TYPE.TILEMAP) {
      const { left, top } = point.snapToGrid();
      if (left === this.lastMoveLeft && top === this.lastMoveTop) {
        // 未移出当前格子
        return;
      }
      const offset = this.getTilemapOffset(point);
      this.lastMoveLeft = offset.left;
      this.lastMoveTop = offset.top;
      this.moveObject(this.selectedObject, offset, opacity);
    } else {
      const offset = this.getObjectOffset(point);
      this.moveObject(this.selectedObject, offset, opacity);
    }
  }

  handleMouseUp(e) {
    this.ctrlKeyDown = false;
    
    const { absolutePointer } = e;
    const point = new Offset(absolutePointer.x, absolutePointer.y);
    // HACK: 移动物体后transform.actionPerformed设为true，防止移动文字时进入编辑状态
    // https://github.com/fabricjs/fabric.js/blob/fd8a6dd334ee1f5b211127df6d3b6fe4b50ba511/src/mixins/itext_click_behavior.mixin.js#L156
    if (e.transform && (point.left !== this.startLeft || point.top !== this.startTop)) {
      e.transform.actionPerformed = true;
    }
    
    if (!this.panning) return;
    
    this.panning = false;
    this.finishMove(this.selectedObject, point);
    this.clear();
  }

  handleObjectModified(e) {
    const { __typename } = e.target;
    console.log('action', e.action);
    
    if (e.action === 'rotate') {
      const { id, left, top, angle } = e.target;
      const data = { left, top, angle };
      if (__typename === OBJECT_TYPE.IMAGE) {
        this.businessLogic.updateImage(id, data);
      } else if (__typename === OBJECT_TYPE.TEXT) {
        this.businessLogic.updateText(id, data);
      }
    } else if (['scale', 'scaleX', 'scaleY'].includes(e.action)) {
      const { id, left, top, width, height, scaleX, scaleY } = e.target;
      const data = { left, top, width: width * scaleX, height: height * scaleY };
      if (__typename === OBJECT_TYPE.IMAGE) {
        this.businessLogic.updateImage(id, data);
      } else if (__typename === OBJECT_TYPE.BACKGROUND) {
        this.businessLogic.updateBackground(id, data);
      }
    } else if (e.action === 'resizing') {
      if (__typename === OBJECT_TYPE.TEXT) {
        const { id, left, top, width, height } = e.target;
        const data = { left, top, width, height };
        this.businessLogic.updateText(id, data);
      }
    }
  }

  handleTextEditingExited(e) {
    // 等待 exitEditing 完成
    setTimeout(() => {
      const { id, __typename, text, width, height } = e;
      if (__typename === OBJECT_TYPE.TEXT) {
        if (text) {
          const data = { content: text, width, height };
          this.businessLogic.updateText(id, data);
        } else {
          this.businessLogic.unselectObject();
          this.businessLogic.removeObject(id);
        }
      }
    }, 0);
  }

  handleTextChanged(e) {
    const { id, text, width, height } = e;
    const data = { content: text, width, height };
    this.businessLogic.updateText(id, data);
  };

  handleContextMenu(e) {
    // 如果contextmenu事件是由ctrl加左键按下触发的，则不继续执行
    if (this.ctrlKeyDown) return;

    const { x, y } = this.canvas.canvas.getPointer(e);
    const point = new Offset(x, y);
    const object = this.businessLogic.findByPoint(point);
    if (object) {
      const canvasObject = this.canvas.getObject(object.id);
      this.businessLogic.selectObjectAndOpenContextMenu(canvasObject.id, e.clientX, e.clientY);
      this.selectedObject = canvasObject;
      this.objectStartLeft = canvasObject.left;
      this.objectStartTop = canvasObject.top;
    } else {
      this.businessLogic.unselectObjectAndCloseContextMenu();
      this.selectedObject = null;
    }
    this.clear();
  }

  async handleKeyDown(e) {
    if (e.key === 'Control') {
      if (this.selectedObject && this.selectedObject.isEditing) {
        this.canvas.exitEditing(this.selectedObject.id);
      }
    }

    const isDelKey = e.key === 'Backspace' || e.key === 'Delete';
    const targetTag = e.target.tagName.toUpperCase();
    const isTargetInput = targetTag === 'INPUT' || targetTag === 'TEXTAREA';
    if (isDelKey && !isTargetInput) {
      if (this.selectedObject && !this.selectedObject.isEditing) {
        const { id } = this.selectedObject;
        const canRemove = await this.businessLogic.canRemoveTilemap(id);
        if (canRemove) {
          this.businessLogic.removeObject(id);
          this.businessLogic.unselectObject();
        }
      }
    }
  }

  getTilemapOffset(point) {
    const { left, top } = point.snapToGrid();
    let tilemapLeft = left + this.objectStartLeft - this.startLeft;
    let tilemapTop = top + this.objectStartTop - this.startTop;
    const { width, height } = this.selectedObject;
    const rect = Rect.fromLTWH(tilemapLeft, tilemapTop, width, height)
      .limitInRect(this.businessLogic.mapRect);
    return new Offset(rect.left, rect.top);
  }

  getObjectOffset(point) {
    const left = this.objectStartLeft + point.left - this.startLeft;
    const top = this.objectStartTop + point.top - this.startTop;
    return new Offset(left, top);
  }

  moveObject(object, offset, opacity) {
    if (object == null) return;

    const { left, top } = offset;
    object.set({ left, top, opacity });
    object.setCoords();
    this.canvas.renderAll();
  }

  finishMove(object, point) {
    const { __typename, id } = object;
    if (__typename === OBJECT_TYPE.TILEMAP) {
      const tilemapOffset = this.getTilemapOffset(point);
      const { left, top } = tilemapOffset;
      const opacity = object.zIndex === NEW_LAYERS.FLAG_OBJ ? TILE_EFFECT_OPACITY : 1;
      this.moveObject(object, tilemapOffset, opacity);
      if (left === this.objectStartLeft && top === this.objectStartTop) {
        this.clear();
        return;
      }
      
      const data = { left, top };
      const result = this.businessLogic.updateTilemap(id, data);
      if (result) {
        this.clear();
        this.objectStartLeft = left;
        this.objectStartTop = top;
      } else {
        this.clear();
        const point = new Offset(this.objectStartLeft, this.objectStartTop);
        const opacity = object.zIndex === NEW_LAYERS.FLAG_OBJ ? TILE_EFFECT_OPACITY : 1;
        this.moveObject(object, point, opacity);
      }
    } else {
      const offset = this.getObjectOffset(point);
      const obj = this.businessLogic.store.getObject(id);
      const opacity = obj?.opacity ?? 1;
      this.moveObject(object, offset, opacity);
      if (offset.left === this.objectStartLeft && offset.top === this.objectStartTop) {
        this.clear();
        return;
      }

      let result;
      const data = { id, left: offset.left, top: offset.top };
      if (__typename === OBJECT_TYPE.TEXT) {
        result = this.businessLogic.updateText(id, data);
      } else if (__typename === OBJECT_TYPE.IMAGE) {
        result = this.businessLogic.updateImage(id, data);
      } else if (__typename === OBJECT_TYPE.BACKGROUND) {
        result = this.businessLogic.updateBackground(id, data);
      }
      if (result) {
        this.clear();
        this.objectStartTop = offset.top;
        this.objectStartLeft = offset.left;
      } else {
        this.clear();
        const point = new Offset(this.objectStartLeft, this.objectStartTop);
        this.moveObject(object, point, opacity);
      }
    }
  }

  clear() {
    this.panning = false;
    this.startLeft = null;
    this.startTop = null;
    this.movePoint = null;
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
  }
}

export default ToolEdit;
