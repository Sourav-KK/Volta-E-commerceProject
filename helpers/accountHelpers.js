const { response } = require('express');
const db = require('../config/connection');
const { resolve } = require('path');
const { ObjectId } = require('mongodb');
const { type } = require('os');

module.exports = {

    updateAccount: (userId, newName, newEmail, newMobile) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.users.updateOne({ _id: userId },
                    {
                        $set: { name: newName, email: newEmail, mobile: newMobile }
                    }).then((response) => {
                        resolve({ updation: true })
                    })
            } catch (error) {
                console.log(error.message, ' error in  accountHelpers + updateAccount');
            }
        })
    },
    getAddresses: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.users.findOne({ _id: userId }, { 'address': 1, '_id': 0 }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' error in  accountHelpers + getAddresses');
            }
        })
    },
    getOneAddress: (id, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let one = await db.users.findOne(
                    {
                        _id: new ObjectId(userId)
                    },
                    {
                        address: {
                            $elemMatch: {
                                _id: new ObjectId(id)
                            }
                        }
                    })
                resolve(one)

            } catch (error) {
                console.log(error.message, ' err in accountHelpers + getOneAddress ');
            }
        })
    },
    addAddress: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let addExists = await db.users.findOne({ _id: userId, "address.streetAddress": data.streetAddress, "address.pincode": data.pincode })

                if (addExists) {
                    resolve({ status: false, message: 'address already exists' })
                } else {
                    db.users.updateOne({ _id: userId },
                        {
                            $push: { address: data }
                        })
                        .then((response) => {
                            resolve({ status: true })
                        })
                }
            } catch (error) {
                console.log(error.message, ' error in  accountHelpers + addAddress');
            }
        })
    },
    updateAddress: (userId, data) => {
        // console.log(data.addId, ' data in accountHelpers + updateAddress');
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.users.findOne({ _id: userId })
                let address = user.address
                let addressIndex = address.findIndex(address => address._id == data.addId)
                
                await db.users.updateOne({ _id: userId }, {
                    $set: {
                        ['address.' + addressIndex]: data
                    }
                }).then((response) => {
                    resolve({ status: true })
                })
            } catch (error) {
                console.log(error.message, ' err in accountHelpers + updateAddress');
            }
        })
    },
    removeAddress: (id, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.users.updateOne(
                    {
                        _id: new ObjectId((userId))
                    },
                    {
                        $pull: {
                            address: { _id: new ObjectId(id) }
                        }
                    }).then((response) => {
                        resolve({ deletion: true })
                    })
            } catch (error) {
                console.log(error.message, ' err in accountHelpers + removeAddress ');
            }
        })
    },

    // display wallet amount
    wallet: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wall = await db.wallet.findOne({ userId: userId }, { _id: 0, amount: 1 })
                resolve(wall)
            } catch (error) {
                console.log(error.message, ' err in accountHelpers + wallet');
            }
        })
    },
}