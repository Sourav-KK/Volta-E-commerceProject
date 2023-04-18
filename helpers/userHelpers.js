const db = require('../config/connection');
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { cart, order } = require('../config/connection');
const { ObjectId } = require('mongodb');
const { ObjectID } = require('bson');


module.exports = {
    dosignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                db.users.find({ email: userData.email }).then(async (user) => {
                    if (user.length == 0) {
                        userData.password = await bcrypt.hash(userData.password, 10)
                        let data = await db.users(userData)
                        data.save()
                        response.user = data
                        response.status = true
                        resolve(response)
                    } else {
                        // alert(" user already exists");
                        resolve({ status: false })
                    }
                })
            } catch (err) {
                console.log(err, " this is error in dosignup catch");
            }
        })
    },

    dologin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let user = await db.users.findOne({ email: userData.email, blocked: false })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            // login successfull
                            response.user = user
                            response.status = true
                            resolve(response)//this response contains both user and status
                        } else {
                            resolve({ status: false })
                        //login failed : invalid credentials
                        }
                    })
                } else {
                    resolve({ status: false })
                    // login failed : no such user exists
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    findUser:(userId)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.users.findOne({_id:userId})
                resolve(user)
            } catch (error) {
                console.log(error.message,' error in  userHelpers + findUser');
            }
        })
    },

    addToCart: (proId, userId) => {        
        let proObj = {
            products: proId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.cart.findOne({ user: userId })

                if (userCart) {
                    // userCart exists
                    let proExists = userCart.cartItems.findIndex(cartItems => cartItems.products == proId)
                    // checking if product trying to add to cart already exists in cart. Also returns the index value of the product in the array 

                    if (proExists != -1) {// if product exists in cart increment the quantity
                        db.cart.updateOne({ user: userId, "cartItems.products": proId }, {
                            $inc: { "cartItems.$.quantity": 1 }
                        }).then(() => {
                            resolve()
                        })
                    } else {
                        //  product do not exists in cart
                        db.cart.updateOne({ user: userId }, {
                            $push: {
                                cartItems: [proObj]
                            }
                        }).then((response) => {
                            resolve()
                        })
                    }
                } else {
                    // creating a new cart for user
                    await db.cart.create({
                        user: userId,
                        cartItems: [proObj]
                    }).then(() => {
                        resolve();
                    })
                }
            } catch (error) {
                console.log(error.message, ' err in userHelpers + addToCart');
            }
        })
    },

    getCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.cart.aggregate([
                    {
                        $match: { user: userId }
                    },
                    {
                        $unwind: '$cartItems'
                    },
                    {
                        $project: {
                            item: '$cartItems.products',
                            quantity: '$cartItems.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "item",//field in cart collection
                            foreignField: "_id",
                            as: 'cartItems'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            products: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    }
                ])
                resolve(data)
            } catch (error) {
                console.log(error.message, ' err in userHelpers + gerCart');
            }
        })
    },

    firstOrder:(id)=>{
        return new Promise(async (resolve, reject) => {
            try {
                db.order.find({userId:id}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message,' error in  userHelpers + firstOrder');
            }
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                let cart = await db.cart.findOne({ user: new ObjectId(userId) })
                if (cart) {
                    count = cart.cartItems.length
                } resolve(count)
            } catch (error) {
                console.log(error.message, ' error in userHelpers + getCartCount');
            }
        })
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise(async (resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    await db.cart.updateOne({ _id: details.cartID },
                        {
                            $pull: { cartItems: { products: details.prodID } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
                }
                else {
                    await db.cart.updateOne({ _id: details.cartID, "cartItems.products": details.prodID }, {
                        $inc: { "cartItems.$.quantity": details.count }
                    }).then((response) => {
                        resolve({ status: true })
                    })
                }
            } catch (error) {
                console.log(error.message, ' error in userHelpers + changeProductQuantity');
            }
        })
    },

    removeCartProduct: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.cart.updateOne({ _id: data.cartId },
                    {
                        $pull: { cartItems: { products: data.proId } }
                    }).then((response) => {
                        resolve({ removeProd: true })
                    })
            } catch (error) {
                console.log(error.message, ' error message in userHelpers + removeCartProduct');
            }
        })
    },

    getTotalAmnt: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.cart.aggregate([
                    {
                        $match: { user: new ObjectID(userId) }
                    },
                    {
                        $unwind: {path:'$cartItems'}
                    },
                    {
                        $project: {
                            item: '$cartItems.products',
                            quantity: '$cartItems.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "item",//field in cart collection
                            foreignField: "_id",
                            as: 'cartItems'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            products: { $arrayElemAt: ['$cartItems', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$products.marketPrice'] } }
                        }
                    }
                ])
                resolve(total[0].total)
            } catch (error) {
                console.log(error.message, ' error in userHelpers + getTotalAmnt');
            }
        })
    },

    placeOrder: (order, products, total) => {
        // place order with the details and along with it remove the prodcuts from the cart
        return new Promise(async (resolve, reject) => {
            try {
                let status = order.paymentMethod == 'COD' ? 'paypal' : 'razorpay'
                let paymentStat = 'Pending'
                let orderObj = {
                    deliveryDetails: {
                        name: order.name,
                        mobile: order.mobile,
                        address: order.address,
                        state: order.state,
                        country: order.country,
                        pincode: order.pincode,
                        email: order.email,
                        paymentMethod: order.paymentMethod,
                        status: status,
                        total: total,
                        products: products,
                    },
                    userId: order.userId,
                    date: Date(),
                    approval: order.approval,
                    orderStatus: '0',
                    paymentStatus: paymentStat
                }

                await db.order.insertMany(orderObj).then(async (responsed) => {
                    await db.cart.findOneAndRemove({ user: order.userId }).then(async(response)=>{
                        resolve(response)
                    })
                })
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + palceOrder');
            }
        })
    },
    
    // finding the cart corresponding to the user 
    getCartProductList: (userId) => { 
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.cart.findOne({ user: userId })
                resolve(cart.cartItems)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + getCartProductList');
            }
        })
    },

    getUserOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.order.find({ userId: userId }).sort({ "date": -1 })
                resolve(orders)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + getUserOrder');
            }
        })
    },

    getCancelorder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cancelOrder = await db.order.updateOne({ _id: orderId }, { $set: { approval: false } })
                resolve(cancelOrder)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + getCancelorder');
            }
        })
    },

    removeOrderProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let action = await db.order.deleteOne({ _id: ObjectId(orderId) })
                resolve(action)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + removeOrderProduct');
            }
        })
    },

    getOneProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let oneProduct = await db.order.aggregate([
                    {
                      '$match': {
                        '_id': new ObjectId(orderId)
                      }
                    }, {
                      '$unwind':{
                        'path': '$deliveryDetails.products'}
                    }, {
                      '$project': {
                        'item': '$deliveryDetails.products.products', 
                        'qty': '$deliveryDetails.products.quantity',
                        'itemId': '$deliveryDetails.products._id',
                        'return': '$deliveryDetails.products.return'
                      }
                    }, {
                      '$lookup': {
                        'from': 'products', 
                        'localField': 'item', 
                        'foreignField': '_id', 
                        'as': 'orderDetails'
                      }
                    }, {
                      '$project': {
                        'item': 1, 
                        'qty': 1,
                        'itemId':1, 
                        'return':1,
                        'products': {
                          '$arrayElemAt': [
                            '$orderDetails', 0
                          ]
                        }
                      }
                    }
                  ])
                resolve(oneProduct)
            } catch (error) {
                console.log(error.message, ' error in userHelpers + getOneProduct');
            }
        })
    },
    // to return product
    oneOrder:(orderId)=>{
        return new Promise(async (resolve, reject) => {
            try {
                 await db.order.find({_id:new ObjectID(orderId)}).then((response)=>{
                    resolve(response)
                 })
                
            } catch (error) {
                console.log(error.message,' error in  userHelpers + oneOrder');
            }
        })
    },

    oneAmount:(prodId,quantity)=>{
        return new Promise(async (resolve, reject) => {
            try {
                let amnttt = await db.products.find({_id : prodId})
                let amount = amnttt[0].marketPrice*quantity
                resolve({amount})

            } catch (error) {
                console.log(error.message,' error in  userHelpers + oneAmount');
            }
        })
    },

    returnItem:(prodId)=>{
        const  orderId = prodId.orderId.split(',')[0];
        const itemId = prodId.orderId.split(',')[1];
        const productId = prodId.orderId.split(',')[2];

        return new Promise(async (resolve, reject) => {
            try {
                
                let productDetail = await db.order.updateOne(
                    {
                      "deliveryDetails.products._id": new ObjectID(itemId)
                    },
                    {
                      $set: {
                        "deliveryDetails.products.$[elem].return": true
                      }
                    },
                    {
                      arrayFilters: [
                        {
                          "elem._id": new ObjectId(itemId)
                        }
                      ]
                    }
                  );
                resolve(productDetail)
            } catch (error) {
                console.log(error.message,' error in  userHelpers + returnItem');
            }
        })
    },

    addToWallet:(userId,amount)=>{
        amount = amount.amount        
        return new Promise(async (resolve, reject) => {
            try {
                await db.wallet.updateOne(
                    {
                        userId: new ObjectID(userId)
                    },{
                        $inc:{
                            amount:amount
                        }
                    },{ 
                        upsert: true 
                    }).then((response)=>{{
                        resolve(response)
                    }})
            } catch (error) {
                console.log(error.message,' error in  userHelpers + addToWallet');
            }
        })
    },
    increaseQuantity:(quantity,productId)=>{
        return new Promise(async (resolve, reject) => {
            try {
                await db.products.updateOne(
                    {
                    "_id": new ObjectID(productId)
                },{
                    $inc:{
                        stock:quantity
                    }
                },{
                    upsert:true
                }).then((respone)=>{
                    resolve({status: true})
                })
            } catch (error) {
                console.log(error.message,' error in  userHelpers + increaseQuantity');
            }
        })
    },


    // 
    changePaymentStatus: (userIds, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let odd = await db.order.find({ userId: userIds })
                odd = odd.reverse()
                let orderIndex = odd[0]._id
                db.order.updateOne(
                    {
                        _id: orderId
                    },
                    {
                        $set: {
                            paymentStatus: 'PAID'
                        }
                    }
                ).then((response) => {
                    resolve()
                })
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + paymentStatus');
            }
        })
    }
}