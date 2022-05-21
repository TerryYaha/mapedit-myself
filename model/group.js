import Rect from './rect';

class Group {
  constructor(id) {
    this.id = id;
    // 层级从低到高排序
    this.objects = [];
  }

  getRect() {
    let groupRect = null;
    this.objects.forEach((object) => {
      const rect = Rect.fromLTWH(object.left, object.top, object.width, object.height);
      if (groupRect === null) {
        groupRect = rect;
      } else {
        groupRect = groupRect.expandToInclude(rect);
      }
    });
    return groupRect;
  }
}

export default Group;
