const express =  require('express');
const router = express.Router();
const isAuth = require('../config/auth');

const { addProduct, allProducts, getProduct } = require('../controller/product.controller');


router.post('/add-product', isAuth, addProduct);
router.get('/all-products', isAuth, allProducts);
router.get('/get-product/:productId', isAuth, getProduct);

module.exports = router;