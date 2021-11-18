const socketIO = require("socket.io");
const app = require("./app");
const shareSession = require("express-socket.io-session");
const roomModel = require("./models/room");
const messageModel = require("./models/message");

module.exports = (server) => {
  const io = socketIO(server);
  io.use(shareSession(app.session));
  io.on("connection", (socket) => {

    if (
      socket.handshake.session &&
      socket.handshake.session._id
    ) {
      socket.join(socket.handshake.session._id);
    }

    socket.on("START_CONVERSATION", async ({ type, id }) => {
      // Lấy ra ID của bản thân mình từ thông tin đăng nhập lưu trong Session
      const currentUserId = socket.handshake.session._id;

      // Tạo một mảng UserID với ID đầu tiên chính là của chủ Room
      const users = [currentUserId];
      let room;
      // Nếu type là User thì tìm Room giữa 2 User
      if (type === "user") {
        users.push(id);
        room = await roomModel
          .findOne({
            users: { $all: users },
            type: "private",
          })
          .populate("users");
      }
      // Nếu type là Room thì tìm Room với ID
      // kèm theo điều kiện phải có User hiện tại trong đó
      if (type === "room") {
        room = await roomModel
          .findOne({
            users: { $all: users },
            _id: id,
          })
          .populate("users");
      }
      // Nếu Room không tồn tại và type là User
      // thì sẽ tạo ra Room mới
      if (!room && type === "user") {
        room = await new roomModel({
          users: users,
        }).save();
        room = await roomModel.findById(room._id).populate("users");
      }
      // Đến đây, nếu như đã có Room thì trả Room về cho Client
      if (room) {
        socket.emit("START_CONVERSATION_SUCCESS", { room });
      }
    });


    socket.on("GET_MESSAGE", async ({ roomID }) => {
      const messages = await messageModel
        .find({ room_id: roomID })
        .sort("-_id");
      socket.emit("RECEIVER_MESSAGE", { messages });
    });

    socket.on("NEW_MESSAGE", async ({ roomID, authorID, body }) => {
      const room = await roomModel.findById(roomID);
      if (!room) return;
      const mess = await new messageModel({
        body,
        author_id: authorID,
        room_id: roomID,
      }).save();

      socket.emit("RECIEVER_NEW_MESSAGE", { mess });
      room.users.forEach((u) => socket.to(u));
      socket.emit("RECIEVER_NEW_MESSAGE", { mess });
    });


  });
};