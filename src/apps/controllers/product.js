const CategoriesModel = require("../models/category");
const ProductsModel = require("../models/product");
const paginate = require("../../common/paginate");
const fs = require("fs");
const path = require("path");
const slug = require("slug");
const index = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    skip = page * limit - limit;

    const total = await ProductsModel.find().countDocuments();
    const totalPage = Math.ceil(total/limit);
    // (paginate(page, totalPage);

    const products = await ProductsModel.find()
                                        .populate({ path: "cat_id" })
                                        .skip(skip)
                                        .limit(limit)
                                        .sort({"_id": -1});
    // console.log(products);
    res.render("admin/products/product", 
    { 
        products: products,
        pages: paginate(page, totalPage),
        page: page,
        totalPage: totalPage,
    });
}
const create = async (req, res) => {
    
    const categories = await CategoriesModel.find();
    // console.log(categories);
    res.render("admin/products/add_product", {categories:categories});
}

const store = async (req, res)=>{
    const body = req.body;
    const file = req.file;
    const product = {
        description: body.description,
        cat_id: body.cat_id,
        price: body.price,
        status: body.status,
        featured: body.featured === "on",
        promotion: body.promotion,
        warranty: body.warranty,
        accessories: body.accessories,
        is_stock: body.is_stock,
        name: body.name,
        slug: slug(body.name),
    }
    if(file){
        const thumbnail = "products/"+file.originalname;
        product["thumbnail"] = thumbnail;
        fs.renameSync(file.path, path.resolve("src/public/images", thumbnail));
        new ProductsModel(product).save();
        res.redirect("/admin/products");
    }
    // new ProductsModel(product).save();
    // res.redirect("/admin/products");
}

const edit = async (req, res) => {
    const categories = await CategoriesModel.find();
    const id = req.params.id;
    const product = await ProductsModel.findById(id);
    // console.log(product);
    res.render("admin/products/edit_product", {categories: categories, product:product});
}
const update = async (req, res)=>{
    const id = req.params.id;
    const body = req.body;
    const file = req.file;
    const product = {
        description: body.description,
        cat_id: body.cat_id,
        price: body.price,
        status: body.status,
        featured: body.featured === "on",
        promotion: body.promotion,
        warranty: body.warranty,
        accessories: body.accessories,
        is_stock: body.is_stock,
        name: body.name,
        slug: slug(body.name),
    }
    if(file){
        const thumbnail = "products/"+file.originalname;
        product["thumbnail"] = thumbnail;
        fs.renameSync(file.path, path.resolve("src/public/images", thumbnail));
    }
    await ProductsModel.updateOne({_id: id}, {$set: product});
    res.redirect("/admin/products");
}
const del = async (req, res) => {
    const id = req.params.id;
    await ProductsModel.deleteOne({_id: id});
    res.redirect("/admin/products");
}
module.exports = {
    index: index,
    create: create,
    store: store,
    edit: edit,
    update: update,
    del: del,
}