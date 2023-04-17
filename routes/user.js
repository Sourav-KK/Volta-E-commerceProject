var express = require('express');
const { response } = require('../app');
var router = express.Router();
const {verifyUserLogin}= require('../controllers/userVerify');
const {getLandingPage,getUserLogin, postUserLogin, getUserSignup, postUserSignup, getUserHome, getOTPLogin, postOTPLogin, getEnterOtp, postOTPVerify, getUserlogout, getAccount, postUpdateAccount, addAddress, postaddAddress, removeAddress, getEditAddress, postEditAddress, getProduct, getCart, getToAddCart, postChangeProductQuantity, postRemoveCartProduct, getCheckout, postCheckout, checkCoupon, couponValidator, getSuccess, paypalOrder, paypalSuccess, getOrderlist, getCancelorder, postRemoveOrderProduct, getOrderDetails, returnItem} = require('../controllers/userControllers');

/* GET home page. */
router.get('/', getLandingPage );

router.get('/home', verifyUserLogin, getUserHome )

// LOGIN, SIGNUP, Logout, Ootppage
router.get('/login', getUserLogin )

router.post('/login', postUserLogin )

router.get('/signup', getUserSignup )

router.post('/signup', postUserSignup )

router.get('/otplogin', getOTPLogin )

router.post('/otplogin', postOTPLogin )//send otp code

router.get('/enterotp', verifyUserLogin, getEnterOtp)

router.post('/enterotp', postOTPVerify)

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

router.get('/checkout', verifyUserLogin, getCheckout)

router.post('/checkout',verifyUserLogin, postCheckout)

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
