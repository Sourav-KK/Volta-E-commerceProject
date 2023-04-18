const { response } = require('express');
const db = require('../config/connection');
const fs = require('fs');
const { resolve } = require('path');
const { ObjectId } = require('mongodb');


module.exports = {    
    dailySales: () => {
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
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' error in reportHelpers + dailySales');
            }
        })
    },

    monthlySales: () => {
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

                for (let i = 0; i < products.length; i++) {
                    for (let j = 0; j < data.length; j++) {
                      if (products[i]._id.toString() === data[j]._id.toString()) {
                        products[i].quantity = data[j].quantity;
                        break;
                      }
                    }
                  }
                resolve(products)
            } catch (error) {
                console.log(error.message, ' error in reportHelpers + oneProduct');
            }
        })
    },
}