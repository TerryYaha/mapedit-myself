import { Tool } from '../const';
import ToolDefault from './toolDefault';
import ToolEdit from './toolEdit';
import ToolEraser from './toolEraser';
import ToolGrab from './toolGrab';
import ToolImage from './toolImage';
import ToolSetting from './toolSetting';
import ToolText from './toolText';
import ToolFloor from './toolFloor';
import ToolEffect from './toolEffect';
import ToolWall from './toolWall';

class ToolManager {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;
    this.currentTool = null;
    this.tools = {};
  }

  initialize() {
    this.toolDefault = new ToolDefault(this.canvas, this.businessLogic);
    this.toolDefault.register();

    this.tools = {
      [Tool.Select]: new ToolEdit(this.canvas, this.businessLogic),
      [Tool.Eraser]: new ToolEraser(this.canvas, this.businessLogic),
      [Tool.Hand]: new ToolGrab(this.canvas, this.businessLogic),
      [Tool.InsertSticker]: new ToolImage(this.canvas, this.businessLogic),
      [Tool.Copy]: new ToolSetting(this.canvas, this.businessLogic),
      [Tool.InsertText]: new ToolText(this.canvas, this.businessLogic),
      [Tool.InsertFloor]: new ToolFloor(this.canvas, this.businessLogic),
      [Tool.InsertEffect]: new ToolEffect(this.canvas, this.businessLogic),
      [Tool.InsertWall]: new ToolWall(this.canvas, this.businessLogic),
    };
  }

  dispose() {
    this.unregisterTool();
    this.toolDefault.unregister();
    this.toolDefault = null;
  }

  registerTool({ type, data }) {
    if (this.currentTool) {
      this.currentTool.unregister();
    }
    this.currentTool = this.tools[type];
    this.currentTool.register(data);
  }

  unregisterTool() {
    if (this.currentTool == null) return;
    this.currentTool.unregister();
    this.currentTool = null;
  }
}

export default ToolManager;
