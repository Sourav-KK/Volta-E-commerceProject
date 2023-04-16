const db = require('../config/connection');
module.exports = {

    // chart // 
    totalUsers: () => {
        console.log(' in chartHelpers + totalUsers');
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
        console.log(' in chartHelpers + totalOrders');
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
        console.log(' in chartHelpers + paymentCOD');
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await db.order.find({ "deliveryDetails.paymentMethod": "COD" }).count()
                resolve(payment)
            } catch (error) {
                console.log(error.message, ' error in chartHelpers + paymentCOD');
            }
        })
    },
        paymentPaypal:()=>{
            console.log(' in chartHelpers + paymentPaypal');
            return new Promise(async(resolve, reject) => {
                try {
                    const payment = await db.order.find({ "deliveryDetails.paymentMethod": "PayPal" }).count()
                    resolve(payment)
    
                } catch (error) {
                    console.log(error.message,' error in chartHelpers + paymentPaypal');
                }
            })
        },
        // paymenRazorpay:()=>{
        //     console.log(' in chartHelpers + paymenRazorpay');
        //     return new Promise(async(resolve, reject) => {
        //         try {
        //             const payment = await db.order.find({ "deliveryDetails.paymentMethod": "Razorpay" }).count()
        //             resolve(payment)
         
        //         } catch (error) {
        //             console.log(error.message,' error in chartHelpers + paymenRazorpay');
        //         }
        //     })
        // },
    monthlyOrders: () => {
        console.log(' in chartHelpers + monthlyOrders');
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

    //     xxx:()=>{
    //         console.log(' in chartHelpers + xxx');
    //         return new Promise(async(resolve, reject) => {
    //             try {

    //             } catch (error) {
    //                 console.log(error.message,' error in chartHelpers + xxx');
    //             }
    //         })
    //     }
}

