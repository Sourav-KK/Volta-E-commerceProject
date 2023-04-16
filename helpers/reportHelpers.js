const { response } = require('express');
const db = require('../config/connection');
const fs = require('fs');
const { resolve } = require('path');
const { ObjectId } = require('mongodb');


module.exports = {
    
    dailySales: () => {
        console.log('in reportHelpers + dailySales');
        let todayDate = new Date()
        let thisDay = todayDate.getDate()

        return new Promise(async (resolve, reject) => {
            try {
                await db.order.aggregate([
                    {
                        $match: {
                            "orderStatus": 2,
                        }
                    }, {
                        $unwind: "$deliveryDetails.products"
                    }, {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $dayOfMonth: '$date'
                                    },
                                    thisDay
                                ]
                            }
                        }
                    }, {
                        $group: {
                            _id: "$deliveryDetails.products.products",
                            quantity: {
                                $sum: '$deliveryDetails.products.quantity'
                            },
                        }
                    }
                ]).then((response) => {
                    console.log(response,' response in reportHelpers + dailySales');
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' error in reportHelpers + dailySales');
            }
        })
    },

    monthlySales: () => {
        console.log('in reportHelpers + monthlySales');

        let date = new Date()
        let thisMonth = date.getMonth()

        return new Promise(async (resolve, reject) => {
            try {
                await db.order.aggregate([
                    {
                        $match: {
                            'orderStatus': 2
                        }
                    }, {
                        $unwind: "$deliveryDetails.products"
                    }, {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $month: '$date'
                                    },
                                    thisMonth + 1
                                ]
                            }
                        }
                    }, {
                        $group: {
                            _id: "$deliveryDetails.products.products",
                            quantity: {
                                $sum: '$deliveryDetails.products.quantity'
                            },
                            // total:"$deliveryDetails.total"
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' error in reportHelpers + monthlySales');
            }
        })
    },
    yearlySales: () => {
        console.log('in reportHelpers + yearlySales');

        let date = new Date()
        let thisYear = date.getFullYear()

        return new Promise(async (resolve, reject) => {
            try {
                await db.order.aggregate([
                    {
                        $match: {
                            'orderStatus': 2
                        }
                    }, {
                        $unwind: "$deliveryDetails.products"
                    }, {
                        $match: {
                            $expr: {
                                $eq: [
                                    {
                                        $year: '$date'
                                    },
                                    thisYear
                                ]
                            }
                        }
                    }, {
                        $group: {
                            _id: "$deliveryDetails.products.products",
                            quantity: {
                                $sum: '$deliveryDetails.products.quantity'
                            },
                            // total:"$deliveryDetails.total"
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' error in reportHelpers + yearlySales');
            }

        })
    },
    oneProduct: (data) => {
        console.log(data, ' data in reportHelpers + oneProduct');
        return new Promise(async (resolve, reject) => {
            try {
                let onprod = [] 

                for (let i = 0; i < data.length; i++) {
                    onprod[i] = await db.products.find(
                        {
                            _id: data[i]._id
                        }, {
                        _id: 1,
                        name: 1,
                        category: 1,
                        marketPrice:1
                    })
                } 

                let products = [].concat(...onprod);
                console.log(products,' products in reportHelpers + oneProduct');

                for (let i = 0; i < products.length; i++) {
                    for (let j = 0; j < data.length; j++) {
                      if (products[i]._id.toString() === data[j]._id.toString()) {
                        products[i].quantity = data[j].quantity;
                        break;
                      }
                    }
                  }
                console.log(products,' products in reportHelpers + oneProduct');

                resolve(products)
            } catch (error) {
                console.log(error.message, ' error in reportHelpers + oneProduct');
            }
        })
    },

    // ,xxx:()=>{
    //     console.log('in reportHelpers + xxx');
    //     return new Promise(async (resolve, reject)=>{
    //         try {

    //         } catch (error) {
    //             console.log(error.message, ' error in reportHelpers + xxx');
    //         }

    //     })
    // },
}