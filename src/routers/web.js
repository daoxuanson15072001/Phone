const express = require("express");
const router = express.Router();

// Require Controller
const TestController = require("../apps/controllers/test");
const SiteContoller = require("../apps/controllers/site");
const AuthController = require("../apps/controllers/auth");
const AdminController = require("../apps/controllers/admin");
const ProductController = require("../apps/controllers/product");
const ChatController = require("../apps/controllers/chat");

// Require Middleware
const AuthMiddleware = require("../apps/middlewares/auth");
const UploadMiddleware = require("../apps/middlewares/upload");

router.get("/frm", TestController.frm);
router.post("/frm", TestController.postFrm);
// router.post("/frm", TestController.test);

// Site
router.get("/", SiteContoller.home);
router.get("/category-:slug.:id", SiteContoller.category);
router.get("/product-:slug.:id", SiteContoller.product);
router.post("/product-:slug.:id", SiteContoller.comment);
router.get("/search", SiteContoller.search);
router.post("/add-to-cart", SiteContoller.addToCart);
router.post("/update-cart", SiteContoller.updateCart);
router.get("/del-cart-:id", SiteContoller.delCart);
router.get("/cart", SiteContoller.cart);
router.post("/order", SiteContoller.order);
router.get("/success", SiteContoller.success);

// Admin
router.get("/admin/login", AuthMiddleware.checkLogin, AuthController.login);
router.post("/admin/login", AuthMiddleware.checkLogin, AuthController.postLogin);

router.get("/admin/logout", AuthMiddleware.checkAdmin, AdminController.logout);
router.get("/admin", AuthMiddleware.checkAdmin, AdminController.index);
////////////////////////////////////////////////////////////
router.get("/admin/products", AuthMiddleware.checkAdmin, ProductController.index);
router.get("/admin/products/create", AuthMiddleware.checkAdmin, ProductController.create);
router.post("/admin/products/store", UploadMiddleware.single("thumbnail"), AuthMiddleware.checkAdmin, ProductController.store);
router.get("/admin/products/edit/:id", AuthMiddleware.checkAdmin, ProductController.edit);
router.post("/admin/products/update/:id", UploadMiddleware.single("thumbnail"), AuthMiddleware.checkAdmin, ProductController.update);
router.get("/admin/products/delete/:id", AuthMiddleware.checkAdmin, ProductController.del);

// Chat SocketIO
router.get("/chat", AuthMiddleware.checkUser, ChatController.chat);

module.exports = router;