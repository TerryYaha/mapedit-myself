
import { CELL_HEIGHT, CELL_WIDTH } from "../const";

/**
 * Rect为left,top开right,bottom闭的矩形
 */
class Rect {
  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  static fromLTWH(left, top, width, height) {
    return new Rect(left, top, left + width, top + height);
  }

  static fromPoints(offset1, offset2) {
    const left = Math.min(offset1.left, offset2.left);
    const top = Math.min(offset1.top, offset2.top);
    const right = Math.max(offset1.left, offset2.left);
    const bottom = Math.max(offset1.top, offset2.top);
    return new Rect(left, top, right, bottom);
  }

  get width() {
    return this.right - this.left;
  }

  get height() {
    return this.bottom - this.top;
  }

  getPoints() {
    return {
      tl: new Offset(this.left, this.top),
      tr: new Offset(this.left + this.width, this.top), 
      bl: new Offset(this.left, this.top + this.height),
      br: new Offset(this.left + this.width, this.top + this.height),
    };
  }

  clamp(otherRect) {
    return new Rect(
      clamp(this.left, otherRect.left, otherRect.right),
      clamp(this.top, otherRect.top, otherRect.bottom),
      clamp(this.right, otherRect.left, otherRect.right),
      clamp(this.bottom, otherRect.top, otherRect.bottom),
    );
  }

  snapToGrid() {
    return new Rect(
      Math.floor(this.left / CELL_WIDTH) * CELL_WIDTH,
      Math.floor(this.top / CELL_HEIGHT) * CELL_HEIGHT,
      Math.ceil(this.right / CELL_WIDTH) * CELL_WIDTH,
      Math.ceil(this.bottom / CELL_HEIGHT) * CELL_HEIGHT,
    );
  }

  // 是否与其他rect有重叠
  overlaps(otherRect) {
    return !(
      this.left >= otherRect.right
      || this.top >= otherRect.bottom
      || otherRect.left >= this.right
      || otherRect.top >= this.bottom
    );
  }

  // 返回一个新的rect，恰好包含该rect和otherRect
  expandToInclude(otherRect) {
    const left = Math.min(this.left, otherRect.left);
    const top = Math.min(this.top, otherRect.top);
    const right = Math.max(this.right, otherRect.right);
    const bottom = Math.max(this.bottom, otherRect.bottom);
    return new Rect(left, top, right, bottom);
  }
  
  containPoint(point) {
    return point.left >= this.left
      && point.left < this.right
      && point.top >= this.top
      && point.top < this.bottom;
  }

  containRect(rect) {
    return rect.left >= this.left
      && rect.right <= this.right
      && rect.top >= this.top
      && rect.bottom <= this.bottom;
  }

  limitInRect(rect) {
    let newLeft = this.left;
    let newTop = this.top;
    if (this.left < rect.left) {
      newLeft = rect.left;
    } else if (this.right > rect.right) {
      newLeft = rect.right - this.width;
    }
    if (this.top < rect.top) {
      newTop = rect.top;
    } else if (this.bottom > rect.bottom) {
      newTop = rect.bottom - this.height;
    }
    return Rect.fromLTWH(newLeft, newTop, this.width, this.height);
  }

  resizeInRect(rect) {
    let newLeft = this.left;
    let newRight = this.right;
    let newTop = this.top;
    let newBottom = this.bottom;

    if (this.left < rect.left) {
      newLeft = rect.left;
    } else if (this.right > rect.right) {
      newRight = rect.right;
    }
    if (this.top < rect.top) {
      newTop = rect.top;
    } else if (this.bottom > rect.bottom) {
      newBottom = rect.bottom;
    }
    return new Rect(newLeft, newTop, newRight, newBottom);
  }

  equals(other) {
    if (other == null) return false;
    return this.left === other.left
      && this.top === other.top
      && this.right === other.right
      && this.bottom === other.bottom;
  }
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default Rect;
