const db = require('../config/connection');
module.exports = {

    // chart // 
    totalUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let totUsers = await db.users.find().count()
                resolve(totUsers)
            } catch (error) {
                console.log(error.message, ' error in chartHelpers + totalUsers');
            }
        })
    },
    totalOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let totOrders = await db.order.find().count()
                resolve(totOrders)
            } catch (error) {
                console.log(error.message, ' error in chartHelpers + totalOrders');
            }
        })
    },
    paymentCOD: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await db.order.find({ "deliveryDetails.paymentMethod": "COD" }).count()
                resolve(payment)
            } catch (error) {
                console.log(error.message, ' error in chartHelpers + paymentCOD');
            }
        })
    },
    paymentPaypal: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await db.order.find({ "deliveryDetails.paymentMethod": "PayPal" }).count()
                resolve(payment)

            } catch (error) {
                console.log(error.message, ' error in chartHelpers + paymentPaypal');
            }
        })
    },

    monthlyOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.order.aggregate([
                    {
                        $match: {
                            approval: true
                        }
                    },
                    {
                        $project: {
                            month: { $month: '$date' },
                        }
                    },
                    {
                        $group: {
                            _id: '$month',
                            count: { $sum: 1 }
                        }
                    },
                ])
                resolve(orders)
            } catch (error) {
                console.log(error.message, ' error in chartHelpers + monthlyOrders');
            }
        })
    },
}

