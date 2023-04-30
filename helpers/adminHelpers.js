const db = require('../config/connection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
    dologin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let adminloginStatus = false
                let response = {}
                let admin = await db.adminDetails.findOne({ email: adminData.email })
                if (admin) {
                    bcrypt.compare(adminData.password, admin.password).then((status) => {
                        if (status) {
                            response.admin = admin
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

    // llst of all user status
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allUsers = await db.users.find({})
                resolve(allUsers)
            } catch (error) {
                console.log(error, " error in fetching getAllUsers");
            }
        })
    },

    // details of one user
    oneUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.users.findOne({ _id: new ObjectId(userId) }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log(error, " error in fetching getAllUsers");
            }
        })
    },

    // block one user
    getBlockOneUser: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let blockedUser = await db.users.updateOne({ _id: data }, { $set: { blocked: true } })
                resolve(blockedUser)
            } catch (error) {
                console.log(error.message, " error in blocking user in adminhelpers");
            }
        })
    },

    // unblock one user
    getUnblockUser: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let unblockUser = await db.users.updateOne({ _id: data }, { $set: { blocked: false } })
                resolve(unblockUser)
            } catch (error) {
                console.log(error.message, ' err in unblocking user in adminhelpers');
            }
        })
    },

    // get all orders
    getOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allOrders = await db.order.find({})
                resolve(allOrders.reverse())
            } catch (error) {
                console.log(error.message, ' error in adminHelpers + getOrders');
            }
        })
    },

    // give approval
    getApprove: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let approve = await db.order.updateOne({ _id: orderId }, { $set: { approval: true } })
                resolve(approve)
            } catch (error) {
                console.log(error.message, ' error in adminHelpers + getApprove');
            }
        })
    },

    // cancel order
    getCancel: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let approve = await db.order.updateOne({ _id: orderId }, { $set: { approval: false } })
                resolve(approve)
            } catch (error) {
                console.log(error.message, ' error in adminHelpers + getCancel');
            }
        })
    },

    // change order status
    OrderStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let OrderStatus = await db.order.updateOne({ _id: orderId }, { $inc: { orderStatus: 1 } })
                resolve(OrderStatus)
            } catch (error) {
                console.log(error.message, ' error in adminHelpers + OrderStatus');
            }
        })
    },
}