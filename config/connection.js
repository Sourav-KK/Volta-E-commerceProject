const { name } = require('ejs');
const { text } = require('express');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { email } = require('./adminDetails');
const adminDetails = require('./adminDetails');
const db = mongoose.createConnection('mongodb://127.0.0.1:27017/volta')

db.on('error', (err) => {
    console.log(err)
})

db.once('open', () => {
    console.log('Database connected');
})

const categoryschema = new mongoose.Schema({
    category: String
})

const adminDetailsschema = new mongoose.Schema({
    email: String,
    password: String
})
const userschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    address:[{
        streetAddress:String,
        state:String,
        country:String,
        pincode:Number,
    }],
    blocked: {
        type: Boolean,
        default: false
    }
})

const productschnema = new mongoose.Schema({
    name: String,
    marketPrice: Number,
    category: String,
    quantity: Number,
    description: String,
    stock: Number,
    originalPrice: Number,
    OfferName: String,
    offerDescription: String,
    percentage:Number,
    onOffer:{
        type: Boolean,
        default: false
    }
})

const cartSchema = new mongoose.Schema({
    user:  ObjectId,
    cartItems:
        [{
            products: mongoose.Types.ObjectId,
            quantity: Number
        }]
})

const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    paymentStatus:String,
    approval: {
                type: Boolean,
                default: true
              },
    date:{
            type: Date, 
         },
    orderStatus:{
        type: Number,
        default: 0 // processing // 1: shipped // 2:deliverd // 3: cancelled // 4: request return  // 5: product returned
      },
    deliveryDetails:
    {
        name: String,
        mobile: String,
        email: String,
        address: String,
        state: String,
        country: String,
        pincode: Number,
        paymentMethod: String,
        status: String,
        total: Number,
        products: mongoose.Schema.Types.Mixed
        // paymentStatus: String,
        // totalQuantity: Number,
        // totalPrice: Number,
    }
})

const walletSchema = new mongoose.Schema({
    userId: ObjectId,
    amount : Number
})

const couponSchema = new mongoose.Schema({
    code:String,
    discount:Number,
    minAmount: Number,
    created:{
            type: Date, 
         },
    expiry:{
            type: Date, 
         },
    active:{
        type: Boolean,
        default: false
    }
})

const bannerSchema = new mongoose.Schema({
    title: String,
    description: String,
})

module.exports = {
    users: db.model('users', userschema),
    adminDetails: db.model('adminDetails', adminDetailsschema),
    products: db.model('products', productschnema),
    categories: db.model('categories', categoryschema),
    cart: db.model('cart', cartSchema),
    order: db.model('order', orderSchema),
    coupon: db.model('coupon', couponSchema),
    wallet: db.model('wallet', walletSchema),
    banner: db.model('banner', bannerSchema)

}