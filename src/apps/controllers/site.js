const CategoryModel = require("../models/category");
const ProductModel = require("../models/product");
const CommentModel = require("../models/comment");
const { update } = require("../models/category");
const transporter = require("../../common/transporter");
const path = require("path");
const ejs = require("ejs");
const home = async (req, res) => {

    const LatestProducts = await ProductModel.find({
        is_stock: true,
    }).sort({ _id: -1 }).limit(6);
    const FeaturedProducts = await ProductModel.find({
        is_stock: true,
        featured: true,
    }).limit(6);
    // console.log(LatestProducts);
    // console.log(FeaturedProducts);
    res.render("site/index", {
        LatestProducts: LatestProducts,
        FeaturedProducts: FeaturedProducts,
    });
}
const category = async (req, res) => {
    // const slug = req.params.slug;
    const id = req.params.id;
    const category = await CategoryModel.findById(id);
    const title = category.title
    // console.log(category);
    const products = await ProductModel.find({
        cat_id: id
    }).sort({ _id: -1 });
    res.render("site/category", { title, products });
}
const product = async (req, res) => {
    const id = req.params.id;
    const comments = await CommentModel.find({ prd_id: id });
    const product = await ProductModel.findById(id);
    // console.log(comments)
    res.render("site/product", { product, comments });
}
const comment = async (req, res) => {
    const id = req.params.id;
    const comment = {
        prd_id: id,
        full_name: req.body.full_name,
        email: req.body.email,
        body: req.body.body,
    }
    await new CommentModel(comment).save();
    res.redirect(req.path);
}
const search = async (req, res) => {
    const keyword = req.query.keyword || "";
    const filter = {};
    if (keyword) {
        filter.$text = { $search: keyword }
    }
    // console.log(filter);
    const products = await ProductModel.find(filter);
    res.render("site/search", { keyword, products });
}
const addToCart = async (req, res) => {
    const body = req.body;
    let items = req.session.cart;

    let isUpdate = false;
    // Mua lại sản phẩm đã mua rồi
    items.map((item) => {
        if (item.id === body.id) {
            isUpdate = true;
            item.qty += parseInt(body.qty);
        }
        return item;
    });

    // Mua một sản phẩm mới
    if (!isUpdate) {
        const product = await ProductModel.findById(body.id);
        items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.thumbnail,
            qty: parseInt(body.qty),
        });
    }
    req.session.cart = items;
    res.redirect("/cart");
}
const cart = (req, res) => {
    const products = req.session.cart;
    res.render("site/cart", { products, totalPrice: 0 });
}
const updateCart = (req, res) => {
    const products = req.body.products;
    const items = req.session.cart;
    items.map((item) => {
        if (products[item.id]) {
            item.qty = parseInt(products[item.id]["qty"]);
        }
        return item;
    });
    res.redirect("/cart");
}
const delCart = (req, res) => {
    const id = req.params.id;
    const items = req.session.cart;
    items.map((item, key) => {
        if (item.id === id) {
            items.splice(key, 1);
        }
        return item;
    });
    req.session.cart = items;
    res.redirect("/cart");
}
const order = async (req, res) => {

    const items = req.session.cart;
    const body = req.body;

    const viewPath = req.app.get("views");
    const html = await ejs.renderFile(
        path.join(viewPath, "site/email-order.ejs"),
        {
            name: body.name,
            phone: body.phone,
            add: body.add,
            totalPrice: 0,
            items,
        }
    );

    await transporter.sendMail({
        to: body.mail,
        from: "Vietpro Shop",
        subject: "Xác nhận đơn hàng từ Vietpro Shop",
        html,
    });
    req.session.cart = [];
    res.redirect("/success");
    
}
const success = (req, res) => {
    res.render("site/success");
}
module.exports = {
    home: home,
    category: category,
    product: product,
    comment: comment,
    search: search,
    addToCart: addToCart,
    cart: cart,
    updateCart: updateCart,
    delCart: delCart,
    order: order,
    success: success
}