import Message from "./message";

Message.install = (MapEdit) => {
  MapEdit.config.globalProperties.$message = Message;
};

export default Message;
