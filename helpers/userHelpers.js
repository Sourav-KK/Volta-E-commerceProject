const db = require('../config/connection');
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { cart, order } = require('../config/connection');
const { ObjectId } = require('mongodb');
const { ObjectID } = require('bson');


module.exports = {
    dosignup: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                db.users.find({ email: userData.email }).then(async (user) => {
                    if (user.length == 0) {
                        userData.password = await bcrypt.hash(userData.password, 10)
                        let data = await db.users(userData)
                        data.save()
                        console.log(data, " data of user signup");
                        response.user = data
                        response.status = true
                        resolve(response)
                    } else {
                        console.log(" user already exists");
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
        console.log(userData, " userData in userHelpers + doLogin");
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let user = await db.users.findOne({ email: userData.email, blocked: false })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            console.log(" login successfull");
                            response.user = user
                            response.status = true
                            resolve(response)//this response contains both user and status
                        } else {
                            resolve({ status: false })
                            console.log(' login failed : invalid credentials');
                        }
                    })
                } else {
                    resolve({ status: false })
                    console.log(" login failed : no such user exists");
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    findUser:(userId)=>{
        console.log(userId,' userId in userHelpers + findUser');
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
        console.log(' inside userHelpers + addToCart ')
        
        let proObj = {
            products: proId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.cart.findOne({ user: userId })

                if (userCart) {
                    console.log(userCart, ' userCart exists');
                    let proExists = userCart.cartItems.findIndex(cartItems => cartItems.products == proId)
                    // checking if product trying to add to cart already exists in cart. Also returns the index value of the product in the array 

                    console.log(proExists, ' the product exists');

                    if (proExists != -1) {// if product exists in cart increment the quantity
                        console.log(' in if proExists');
                        db.cart.updateOne({ user: userId, "cartItems.products": proId }, {
                            $inc: { "cartItems.$.quantity": 1 }
                        }).then(() => {
                            console.log(' resolving proExists');
                            resolve()
                        })
                    } else {
                        console.log(' in else proExists,i.e product do not exists in cart ');

                        db.cart.updateOne({ user: userId }, {
                            $push: {
                                cartItems: [proObj]
                            }
                        }).then((response) => {
                            console.log(' resolving proExists');
                            resolve()
                        })
                    }
                } else {
                    console.log(' creating a new cart for user');
                    // let cartObj = {
                    //     user: userId,
                    //     cartItems:[{products:proId}] 
                    // }
                    // console.log(cartObj, ' this is the objs added to the cart');
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
        console.log(userId, ' in userHelpers + getCart');
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
                console.log(data, ' total amount of the products in cart userHelpers + getCart');
                resolve(data)
            } catch (error) {
                console.log(error.message, ' err in userHelpers + gerCart');
            }
        })
    },

    firstOrder:(id)=>{
        console.log(id,' id in userHelpers + firstOrder');
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
        console.log(userId, ' userId in userHelpers + getCartCount');
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
        console.log(' in userHelpers + changeProductQuantity');
        details.count = parseInt(details.count)
        console.log(details.count, ' details.count in userHelpers + changeProductQuantity');
        details.quantity = parseInt(details.quantity)
        console.log(details.quantity, 'details.quantity in userHelpers + changeProductQuantity');
        return new Promise(async (resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    await db.cart.updateOne({ _id: details.cartID },
                        {
                            $pull: { cartItems: { products: details.prodID } }
                        }).then((response) => {
                            console.log('resolving in if of userHelpers + changeProductQuantity');
                            resolve({ removeProduct: true })
                        })
                }
                else {
                    await db.cart.updateOne({ _id: details.cartID, "cartItems.products": details.prodID }, {
                        $inc: { "cartItems.$.quantity": details.count }
                    }).then((response) => {
                        console.log(response, ' resolving in else of userHelpers + changeProductQuantity ');
                        resolve({ status: true })
                    })
                }
            } catch (error) {
                console.log(error.message, ' error in userHelpers + changeProductQuantity');
            }
        })
    },

    removeCartProduct: (data) => {
        console.log(data, ' in userHelpers + removeCartProduct');
        return new Promise(async (resolve, reject) => {
            try {
                await db.cart.updateOne({ _id: data.cartId },
                    {
                        $pull: { cartItems: { products: data.proId } }
                    }).then((response) => {
                        console.log(response, ' resolving in userHelpers + removeCartProduct ');
                        resolve({ removeProd: true })
                    })
            } catch (error) {
                console.log(error.message, ' error message in userHelpers + removeCartProduct');
            }
        })
    },

    getTotalAmnt: (userId) => {
        console.log(' in userHelpers + getTotalAmnt');
        console.log(userId, ' userId in userHelpers + getTotalAmnt');
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
                console.log(total);
                console.log(total[0].total, ' total[0].total before consoling: userHelpers + getTotalAmnt');
                resolve(total[0].total)
            } catch (error) {
                console.log(error.message, ' error in userHelpers + getTotalAmnt');
            }
        })
    },

    placeOrder: (order, products, total) => {
        // place order with the details and along with it remove the prodcuts from the cart
        console.log(order, ' order in userHelpers + palceOrder');
        console.log(products, ' products in userHelpers + palceOrder');
        console.log(total, ' total in userHelpers + palceOrder');

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
                console.log(orderObj, 'order obj in userHelpers + palceOrder');

                await db.order.insertMany(orderObj).then(async (responsed) => {
                    console.log(responsed,'responsed inserted orederObj in order collection in userHelpers + palceOrder');
                    // db.cart.deleteMany({user:order.userId})

                    await db.cart.findOneAndRemove({ user: order.userId }).then(async(response)=>{
                        console.log(response,'response removed cart in userHelpers + palceOrder ');
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
        console.log('  in userHelpers + getCartProductList');
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.cart.findOne({ user: userId })
                console.log(cart, ' cart in userHelpers + getCartProductList');
                resolve(cart.cartItems)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + getCartProductList');
            }
        })
    },

    getUserOrder: (userId) => {
        console.log(userId, ' data in in userHelpers + getUserOrder');
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.order.find({ userId: userId }).sort({ "date": -1 })
                console.log(orders, ' orders in userHelpers + getUserOrder');
                resolve(orders)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + getUserOrder');
            }
        })
    },

    getCancelorder: (orderId) => {
        console.log(orderId, ' data in in  userHelpers + getCancelorder');
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
        console.log(orderId, ' orderId in userHelpers + removeOrderProduct');
        return new Promise(async (resolve, reject) => {
            try {
                let action = await db.order.deleteOne({ _id: ObjectId(orderId) })
                console.log(action, ' before resolving in userHelpers + removeOrderProduct');
                resolve(action)
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + removeOrderProduct');
            }
        })
    },

    getOneProduct: (orderId) => {
        console.log(orderId, ' orderId in userHelpers + getOneProduct');
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
                console.log(oneProduct, ' before resolving in userHelpers + getOneProduct');
                resolve(oneProduct)
            } catch (error) {
                console.log(error.message, ' error in userHelpers + getOneProduct');
            }
        })
    },
    // to return product
    oneOrder:(orderId)=>{
        console.log(orderId,' orderId in userHelpers + oneOrder');
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
        console.log(prodId,' prodId in userHelpers + oneAmount');
        console.log(quantity,' quantity in userHelpers + oneAmount');
        
        return new Promise(async (resolve, reject) => {
            try {
                let amnttt = await db.products.find({_id : prodId})
                let amount = amnttt[0].marketPrice*quantity
                console.log(amount,' amount in userHelpers + oneAmount');
                resolve({amount})

            } catch (error) {
                console.log(error.message,' error in  userHelpers + oneAmount');
            }
        })
    },

    returnItem:(prodId)=>{
        console.log(prodId,' prodId in userHelpers + returnItem');

        const  orderId = prodId.orderId.split(',')[0];
        console.log(orderId,' orderId in userHelpers + returnItem');

        const itemId = prodId.orderId.split(',')[1];
        console.log(itemId,' itemId in userHelpers + returnItem');
        
        const productId = prodId.orderId.split(',')[2];
        console.log(productId,' productId in userHelpers + returnItem');

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
                
                console.log(productDetail,' productDetails in userHelpers + returnItem');
                
                resolve(productDetail)
            } catch (error) {
                console.log(error.message,' error in  userHelpers + returnItem');
            }
        })
    },

    addToWallet:(userId,amount)=>{
        console.log(' in userHelpers + addToWallet');
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
        console.log(quantity,' quantity in userHelpers + increaseQuantity');
        console.log(productId,' productId in userHelpers + increaseQuantity');
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
        console.log(' data in  userHelpers + paymentStatus');
        return new Promise(async (resolve, reject) => {
            try {
                let odd = await db.order.find({ userId: userIds })
                console.log(odd, "odd in  userHelpers + paymentStatus");
                odd = odd.reverse()

                let orderIndex = odd[0]._id
                console.log(orderIndex, " orderIndex in  userHelpers + paymentStatus");
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
                    console.log(response, '*****');
                    resolve()
                }
                )
                // let oddIndex = odd[0].
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + paymentStatus');
            }
        })
    }
    

    // sessionDestroy:(userId)=>{
    //     console.log(data,' data in userHelpers + sessionDestroy');
    //     return new Promise(async (resolve, reject) => {
    //         try {

    //         } catch (error) {
    //             console.log(error.message,' error in  userHelpers + sessionDestroy');
    //         }
    //     })
    // }

    // xxx:(data)=>{
    //     console.log(data,' data in userHelpers + xxx');
    //     return new Promise(async (resolve, reject) => {
    //         try {

    //         } catch (error) {
    //             console.log(error.message,' error in  userHelpers + xxx');
    //         }
    //     })
    // },

}