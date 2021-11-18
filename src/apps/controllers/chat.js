const UserModel = require("../models/user");
const RoomModel = require("../models/room");
module.exports.chat = async (req, res)=>{
    const userID = req.session._id;
    const users = await UserModel.find({
        _id: {$nin: [userID]}
    });

    const rooms = await RoomModel
        .find({
            users: {$all: [userID]}
        })
        .populate({path: "users"});
    res.render("chat", {users, rooms});

}
