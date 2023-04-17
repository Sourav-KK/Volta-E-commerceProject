require('dotenv').config()

const userHelpers = require('../helpers/userHelpers');
const productHelpers = require('../helpers/productHelpers');
const accountHelpers = require('../helpers/accountHelpers');
const bannerHelpers = require('../helpers/bannerHelpers');

const db = require('../config/connection');
const { response } = require('../app');
const { Convert } = require("easy-currencies");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.serviceId;
const client = require('twilio')(accountSid, authToken);

const paypal = require('@paypal/checkout-server-sdk');
const couponHelpers = require('../helpers/couponHelpers');

const Environment =
    process.env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment

const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)

// global variables 

let nav = true;
let footer = true;
let couponAmount = 0

// end global variables 


//Landing Page
const getLandingPage = async function (req, res, next) {
    if (req.session.loggedIn) {
        let use = req.session.loggedIn
        let coursalBanner1 = await bannerHelpers.allBanners()
        let products = await productHelpers.getAllProducts()
        let cartCount =  await userHelpers.getCartCount(req.session.user._id)
        res.render('user/userLandingPage', { nav: true, footer,use,"name": req.session.user.name, coursalBanner1, products,cartCount });
    }else{
        let products = await productHelpers.getAllProducts()
        let coursalBanner1 = await bannerHelpers.allBanners()
        res.render('user/userLandingPage',{ nav: true, footer, products, coursalBanner1})
}
}

//login
const getUserLogin = async function (req, res, next) {
    res.render('user/userLogin', { nav: false, footer: false })
}

const postUserLogin = async (req, res, next) => {
    userHelpers.dologin(req.body).then((response) => {
        if (response.status) {
            req.session.loggedIn = true
            req.session.user = response.user
            res.redirect('/home')
        } else {
            res.redirect('/login')
        }
    })
}
//signup
const getUserSignup = async function (req, res, next) {
    if (req.session.loggedIn) {
        res.redirect('/home')
    }
    else {
    res.render('user/userSignup', { nav: false, footer: false })
    }
}

const postUserSignup = async function (req, res, next) {
    userHelpers.dosignup(req.body).then((data) => {
        if (data.status) {
            res.redirect('/login')
        } else {
            res.redirect('/signup',)
        }
    })
}

const getUserlogout = async (req, res) => {
        req.session.loggedIn = false
        req.session.user._id = null 
        res.redirect('/login')
}

const getUserHome = async (req, res, next) => {
    let user = req.session.user._id
    let use = req.session.loggedIn
    let cartCount =  await userHelpers.getCartCount(req.session.user._id)
    productHelpers.getAllProducts().then((products) => {
    res.render('user/userHome', { products, use, nav: true, footer, "name": req.session.user.name, cartCount})
    })
}

//get One product
const getProduct = async (req, res, next)=> {
    let cartCount =  await userHelpers.getCartCount(req.session.user._id)
    const id = req.query.id
    productHelpers.getOneProduct(id).then((product) => {
        if (product) {
                let use = req.session.loggedIn
                res.render('user/product', { product, nav: true, footer, use, "name": req.session.user.name, cartCount })
            }
    })
}

// OTP Controllers

//Get OTP LoginPage 
const getOTPLogin = async (req, res, next)=> {
    res.render('user/OTPLogin', { nav: false, footer: false })
}
// Posting mobilenumber
const postOTPLogin = async (req, res) => {
    let num = req.body.number
    req.session.number = num
    let userExists = db.users.find({ mobile: num })

    if (userExists) {
        client.verify.v2.services(serviceId)
            .verifications
            .create({ to: "+91" + num, channel: 'sms' })
            .then((data) => {
                res.redirect('/enterotp')
            }).catch((error) => {
                console.log(error.message, ' error in postOTPLogin');
            })
    } else {
        res.redirect('/otplogin')
    }
}
//getting OTP page
const getEnterOtp = async (req, res) => {
    // console.log(req.session.number, ' phone num passed from userControllers + postOtpLogin');
    res.render('user/enterotp', { nav: false, footer: false })
}
// posting otp code
const postOTPVerify = async (req, res) => {
    const otp = req.body.otp
    let nums = req.session.number
    client.verify.v2.services(serviceId)
        .verificationChecks
        .create({ to: `+91` + nums, code: otp })
        .then((data) => {
            res.redirect('/home')
        }).catch(error => { console.log(error.message, ' error in userControllers + postOTPVerify'); })
}

// cart 
const getCart = async (req, res) => {
        let use = req.session.loggedIn
        const userId = req.session.user._id
        let data = await userHelpers.getCart(userId)
        let total = 0
        if (data.length > 0) {
            total = await userHelpers.getTotalAmnt(userId)
        }
        let cartCount =  await userHelpers.getCartCount(req.session.user._id)
        let firstOrder = await userHelpers.firstOrder(userId)
        res.render('user/cart', { nav: true, footer: true, data, total, userId, use,firstOrder, "name": req.session.user.name, cartCount })
}

const getToAddCart = async (req, res) => {
    const user = req.session.user._id
    const id = req.query.id
    userHelpers.addToCart(id, user).then(() => {
        res.redirect('/')
    })
}

const postChangeProductQuantity = async (req, res) => {    
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmnt(req.body.userId)
        res.json(response)
    })
}

const postRemoveCartProduct = async (req, res) => {
    await userHelpers.removeCartProduct(req.body).then((response) => {
        res.json(response)
    })
}

const getCheckout = async (req, res) => {
    let use = req.session.loggedIn
    let user = req.session.user._id
    let email = req.session.user.email
    let name = req.session.user.name
    let mobile = req.session.user.mobile        
    let data = await userHelpers.getCart(user)
    let address = await accountHelpers.getAddresses(user)
    console.log(address," asdj j hj");
    let cartCount =  await userHelpers.getCartCount(req.session.user._id)
    let total = 0
    if (data.length > 0) {
        total = await userHelpers.getTotalAmnt(user)
        if (req.query) {
            var oneAddress = await accountHelpers.getOneAddress(req.query.id,user)
        }
            res.render('user/checkout', { nav, footer, user, use, total, name, email, mobile, paypalClientId: process.env.PAYPAL_CLIENT_ID, address, oneAddress, cartCount})
        // else{
        //     res.render('user/checkout', { nav, footer, user, use, total, name, email, mobile, paypalClientId: process.env.PAYPAL_CLIENT_ID, address})
        // }
    }else{
        res.redirect('/')
    }
}

const checkCoupon = async (req,res)=>{
    try {
        let code = req.body.couponEnter
        couponHelpers.checkCoupon(code).then((response)=>{
            res.json(response)
        })
    } catch (error) {
        console.log(error.message,'error in + userControllers + checkCoupon');
    }
}

const couponValidator = async (req,res)=>{
    try {
        let code = req.query.code
        
        let user = req.session.user._id

        let totalPrice = await userHelpers.getTotalAmnt(user)

        couponHelpers.couponValidator(code, user, totalPrice).then((response)=>{
            couponAmount = response.discountAmount
            res.send(response)
        })
    
    } catch (error) {
        console.log(error.message,'error in + userControllers + couponValidator');
    }
}


const postCheckout = async (req, res) => {
    console.log("sdfjhj j ");
    console.log("post checkout details 12122");
    let products = await userHelpers.getCartProductList(req.session.user)

    let totalPrice = await userHelpers.getTotalAmnt(req.session.user._id)
    totalPrice -= couponAmount

    await userHelpers.placeOrder(req.body, products,totalPrice).then(async(response) => {
        if(req.body.paymentMethod ==='COD'){
            await productHelpers.decreasePdtQuantity(products).then((response)=>{
                res.json({ status: true })
            })
        }
        // else if (req.body.paymentMethod == 'razorpay') {
        //     userHelpers.generateRazorPay(req.session.user, total).then((order) => {
        //         res.json(order)
        //     })
        // }
        else{
            res.json({ paypal: true, total: totalPrice })
        }
    })
}

const paypalOrder = async (req,res)=>{
    // console.log(req.body,'req.body in + userControllers + paypalOrder');
    let total = req.body.total
    total = parseInt(total)

    const request = new paypal.orders.OrdersCreateRequest()
    const value = await Convert(total).from("INR").to("USD")
    let price = Math.round(value)

    request.prefer("return=representation")
        request.requestBody({
            intent: "CAPTURE", // capture payment info from the user 
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: price,
                        breakdown: { // price of each item
                            item_total: {
                                currency_code: "USD",
                                value: price,
                            },
                        },
                    }
                },
            ],
        })
        try {
            const order = await paypalClient.execute(request)
            res.json({ id: order.result.id })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
}

const paypalSuccess = async (req,res)=>{
    const orderDetails = await userHelpers.getUserOrder(req.session.user._id)
    // console.log(orderDetails.deliveryDetails.products," orderDetails in + userControllers + paypalSuccess");

    let orders = orderDetails[0]
    let orderId1 = orders._id
    let orderId = "" + orderId1
    let prods = orders.deliveryDetails.products

    userHelpers.changePaymentStatus(req.session.user._id,orderId).then(()=>{
        productHelpers.decreasePdtQuantity(prods).then(()=>{
            res.json({status:true})
        })
    })
    // res.render('user/success', { nav, footer, use, "name": req.session.user.name })
}

const getSuccess = async (req, res) => {
    res.render('user/success', {  })
}

const getOrderlist = async (req, res) => {
        let use = req.session.loggedIn
        let orders = await userHelpers.getUserOrder(req.session.user._id)
        let currDate = new Date()
        let cartCount =  await userHelpers.getCartCount(req.session.user._id)
        res.render('user/orderlist', { nav, footer, use, orders, currDate, "name": req.session.user.name, cartCount })
}

const getCancelorder = async (req, res) => {
    const id = req.query.id
    await userHelpers.getCancelorder(id).then((response) => {
        res.redirect('/orderlist')
    })
}

const postRemoveOrderProduct = async (req, res) => {
    // console.log(id, ' id of the order in + userControllers + postRemoveOrderProduct');
    await userHelpers.removeOrderProduct(id)
        res.redirect('/orderlist')
}

const getOrderDetails = async (req, res) => {
    let use = req.session.loggedIn
    const id = req.query.id
    let orneOrder = await userHelpers.oneOrder(req.query)
    let product = await userHelpers.getOneProduct(id)
    let cartCount =  await userHelpers.getCartCount(req.session.user._id)
    res.render('user/orderdetails', { nav, footer, use, orneOrder, "name": req.session.user.name, product, cartCount })
}


const returnItem = async (req,res)=>{
    try {
        // console.log(req.body,' req.body in + userControllers + returnItem');
        const productId = req.body.orderId.split(',')[2];
        const quantity = req.body.orderId.split(',')[3];
        let userId = req.session.user._id

        await userHelpers.returnItem(req.body).then(async (response)=>{
             await userHelpers.oneAmount(productId, quantity).then(async (response)=>{
                await userHelpers.addToWallet(userId,response).then(async(response)=>{
                    await userHelpers.increaseQuantity(quantity,productId).then(async(response)=>{
                        res.json(response)
                    })
                })
            })
        })
    } catch (error) {
        console.log(error.message,'error in + userControllers + returnItem');
    }
}

// account, add / edit / delete address
const getAccount = async (req,res)=>{
    let use = req.session.loggedIn
    const userId = req.session.user._id
    let userDetails = await userHelpers.findUser(userId)
    let vilasam = await accountHelpers.getAddresses(userId)
    let cartCount =  await userHelpers.getCartCount(req.session.user._id)
    let wall = await accountHelpers.wallet(userId)
    wall = wall?.amount

    res.render('user/account',{nav,footer,use,"name": req.session.user.name, userId, userDetails, vilasam, wall, cartCount})
}

// update user details
const postUpdateAccount = async (req,res)=>{
    await accountHelpers.updateAccount(req.session.user._id,req.body.name,req.body.email,req.body.mobile).then((response)=>{
            res.json(response)
    })
}
// add new address
const addAddress = async (req,res)=>{
    try {
        let use = req.session.loggedIn
        let cartCount =  await userHelpers.getCartCount(req.session.user._id)
        res.render('user/addAddress',{ nav, footer, use, "name": req.session.user.name, cartCount})
    } catch (error) {
        console.log(error.message,'error in + userControllers + addAddress');
    }
}

const postaddAddress = async (req,res)=>{
    try {
        const userId = req.session.user._id
        
        let streetAddress = req.body.streetAddress
        
        let state = req.body.state

        let country = req.body.country

        let pincode = Number(req.body.pincode)

        let userData = {
            streetAddress,state,country,pincode
        }
        accountHelpers.addAddress(userData,userId).then((response)=>{
            res.json(response)
        })
    } catch (error) {
        console.log(error.message,'error in + userControllers + postaddAddress');
    }
}

const removeAddress = async (req,res)=>{
    try {
        const userId = req.session.user._id
        let key =  Object.keys(req.body)[0];
        
        await accountHelpers.removeAddress(key,userId).then((response)=>{
            res.json(response)
        })
    } catch (error) {
        console.log(error.message,'error in + userControllers + removeAddress');
    }
}
// render edit Address page
const getEditAddress = async (req,res)=>{
    try {
        let use = req.session.loggedIn
        let id = req.query.id
        const userId = req.session.user._id

        let oneAdd = await accountHelpers.getOneAddress(id,userId)
        let cartCount =  await userHelpers.getCartCount(req.session.user._id)

        oneAdd = oneAdd?.address[0]
        
        res.render('user/editAddress',{nav, footer, use, "name": req.session.user.name, oneAdd, cartCount })
    } catch (error) {
        console.log(error.message,'error in + userControllers + getEditAddress');
    }
}

// updating address 
const postEditAddress = async (req,res)=>{
    try {
        // console.log(req.body,'req.body in + userControllers + postEditAddress');
        const userId = req.session.user._id
        await accountHelpers.updateAddress(userId,req.body).then((response)=>{
            res.json(response)
        })
        
    } catch (error) {
        console.log(error.message,'error in + userControllers + postEditAddress');
    }
}

module.exports = {
    getLandingPage,
    getUserLogin,
    postUserLogin,
    getUserSignup,
    postUserSignup,
    getUserlogout,
    getUserHome,
    getProduct,
    getOTPLogin,
    postOTPLogin,
    getEnterOtp,
    postOTPVerify,
    getCart,
    getToAddCart,
    postChangeProductQuantity,
    postRemoveCartProduct,
    getCheckout,
    checkCoupon,
    couponValidator,
    postCheckout,
    paypalOrder,
    paypalSuccess,
    getSuccess,
    getOrderlist,
    getCancelorder,
    getOrderDetails,
    postRemoveOrderProduct,
    returnItem,
    getAccount,
    postUpdateAccount,
    addAddress,
    postaddAddress,
    removeAddress,
    getEditAddress,
    postEditAddress,
}