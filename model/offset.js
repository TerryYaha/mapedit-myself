import { CELL_HEIGHT, CELL_WIDTH } from "../const";

class Offset {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }

  snapToGrid() {
    const left = Math.floor(this.left / CELL_WIDTH) * CELL_WIDTH;
    const top = Math.floor(this.top / CELL_HEIGHT) * CELL_HEIGHT;
    return new Offset(left, top);
  }

  equals(other) {
    if (other == null) return false;
    return this.left === other.left
      && this.top === other.top;
  }
}

export default Offset;
