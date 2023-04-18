var express = require('express');
var router = express.Router();
const {verifyUserLogin} = require('../controllers/userVerify');
const {getLandingPage,getUserLogin, postUserLogin, getUserSignup, postUserSignup, getUserHome, getOTPLogin, postOTPLogin, getEnterOtp, postOTPVerify, getUserlogout, getAccount, postUpdateAccount, addAddress, postaddAddress, removeAddress, getEditAddress, postEditAddress, getProduct, getCart, getToAddCart, postChangeProductQuantity, postRemoveCartProduct, getCheckout, postCheckout, checkCoupon, couponValidator, getSuccess, paypalOrder, paypalSuccess, getOrderlist, getCancelorder, postRemoveOrderProduct, getOrderDetails, returnItem} = require('../controllers/userControllers');

/* GET home page. */
router.get('/', getLandingPage );

router.get('/home', verifyUserLogin, getUserHome )

// LOGIN, SIGNUP, Logout, Ootppage

router.route('/login').get(getUserLogin)
                     .post(postUserLogin)

router.route('/signup').get(getUserSignup)
                        .post(postUserSignup)

router.route('/otplogin').get(getOTPLogin).post(postOTPLogin)

router.route('/enterotp').get(verifyUserLogin, getEnterOtp).post(postOTPVerify)

router.get('/logout', getUserlogout)// logout
// <!-- END LOGIN && SIGNUP -->
 

// USER PROFILE
router.get('/account', verifyUserLogin, getAccount)

router.post('/update-account', verifyUserLogin, postUpdateAccount)

router.route('/addAddress').get(verifyUserLogin, addAddress)
                           .post(postaddAddress)

router.post('/remove-Address', verifyUserLogin, removeAddress)

router.route('/edit-Address').get(verifyUserLogin, getEditAddress)
                             .post(postEditAddress)
// <!--  -->


router.get('/product', verifyUserLogin, getProduct)

// Cart Management 

router.get('/cart', verifyUserLogin, getCart)// show cart page

router.get('/addtocart', verifyUserLogin, getToAddCart)// add to cart

router.post('/changeProductQuantity', verifyUserLogin, postChangeProductQuantity)

router.post('/removeCartProduct', verifyUserLogin, postRemoveCartProduct)
// <!--  -->


// Checkout

router.route('/checkout').get( verifyUserLogin, getCheckout)
                        .post(verifyUserLogin, postCheckout)

router.post('/couponCheck',verifyUserLogin, checkCoupon)

router.get('/coupon-validator',verifyUserLogin, couponValidator)

router.get('/success', verifyUserLogin, getSuccess)

router.post('/createOrder', paypalOrder)

router.post('/paypal-success', paypalSuccess)
// <!--  -->


// Order Management
router.get('/orderlist', verifyUserLogin, getOrderlist)

router.get('/cancelorder', verifyUserLogin, getCancelorder)

router.post('/removeOrderProduct', postRemoveOrderProduct)

router.get('/orderdetails', verifyUserLogin, getOrderDetails)

router.post('/returnItem', verifyUserLogin, returnItem)

module.exports = router;
