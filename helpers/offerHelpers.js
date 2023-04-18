const { response } = require('express');
const db = require('../config/connection');
const fs = require('fs');
const { log } = require('console');
const { ObjectID } = require('bson');

module.exports = {

    addOffer: (data) => {
        var originalPrice
        var marketPrice
        var OfferName
        var offerDescription
        var percentage
        return new Promise(async (resolve, reject) => {
            try {
                let product = await db.products.findOne({ _id: new ObjectID(data.productId) })

                if (product) {
                    let updation = {
                        originalPrice: Math.round(product.marketPrice),
                        marketPrice: Math.round(product.marketPrice - product.marketPrice * (data.percentage / 100)),
                        OfferName: data.title,
                        offerDescription: data.offerDescription,
                        percentage: data.percentage
                    }

                    let updated = await db.products.updateOne({ _id: data.productId }, { $set: updation })
                    resolve()
                }
            } catch (error) {
                console.log(error.message, ' error in offerHelpers + addOffer');
            }
        })
    },
    findAll: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let onOffer = await db.products.find({ onOffer: true })
                resolve(onOffer)
            } catch (error) {
                console.log(error.message, ' error in offerHelpers + findAll');
            }
        })
    }
}