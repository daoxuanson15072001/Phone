const UsersModel = require("../models/user");
const ProductsModel = require("../models/product");
const index = async (req, res)=>{ 
    const users = await UsersModel.find();
    const totalUsers = users.length;
    const products = await ProductsModel.find();
    const totalProducts = products.length;
    res.render("admin/dashboard", {totalUsers:totalUsers, totalProducts:totalProducts});
}
const logout = (req, res)=>{
    req.session.destroy();
    return res.redirect("/admin/login");
}
module.exports = {
    index:index,
    logout:logout,
}