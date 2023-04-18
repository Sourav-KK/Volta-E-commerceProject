const { response } = require('express');
const db = require('../config/connection');
const fs = require('fs');
const { resolve } = require('path');
const { ObjectId } = require('mongodb');

module.exports={
    addCoupon:(data)=>{
        console.log('in couponHelpers + addCoupon');
        return new Promise(async (resolve, reject)=>{
            try {
                let couponObj={
                    code:data.code,
                    active:true,
                    created:Date(),
                    discount:data.discount,
                    minAmount:data.minAmount,
                    expiry:data.expiry,
                }
                console.log(couponObj,'couponObj in couponHelpers + addCoupon');
                await db.coupon.insertMany(couponObj).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' error in couponHelpers + addCoupon');
            }

        })
    },
    getAllCoupon:()=>{
        console.log('in couponHelpers + getAllCoupon');
        return new Promise(async (resolve, reject)=>{
            try {
                    db.coupon.find({}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                    console.log(error.message, ' err in unblocking user in couponHelpers + getAllCoupon');
            }
        })
    },
    deleteCoupon:(coupId)=>{
        return new Promise(async (resolve, reject)=>{
            try {
                db.coupon.deleteOne({"_id":coupId}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' err in couponHelpers + deleteCoupon');
            }
        })
    },
    getOneCoupon:(id)=>{
        return new Promise(async (resolve, reject)=>{
            try {
                let one = db.coupon.find({_id: id})
                    resolve(one)
            } catch (error) {
                console.log(error.message, ' err in unblocking user in couponHelpers + getOneCoupon');
            }
        })
    },
    editCoupon:(data)=>{
        return new Promise(async (resolve, reject)=>{
            try {
                db.coupon.updateOne({code:data.couponCode},
                    {
                        $set:{
                            code:data.couponCode,
                            discount: data.discount,
                            minAmount:data.minAmount
                        }
                    }).then((response)=>{                        
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' err in unblocking user in couponHelpers + editCoupon');
            }
        })
    },
    checkCoupon:(codeo)=>{
        return new Promise(async (resolve, reject)=>{
        try {
                await db.coupon.findOne({code:codeo}).then((response)=>{
                    resolve(response)
                })
        } catch (error) {
            console.log(error.message, ' err in unblocking user in couponHelpers + checkCoupon');          
        }
        })
    },
    couponValidator:(codeo, usero, totalPriceo)=>{
            return new Promise(async (resolve, reject)=>{
                try {
                    let couponExists = await db.coupon.findOne({code:codeo})

                    if (couponExists) {
                        if (new Date(couponExists.expiry) - new Date() >0 ) {
                            if (totalPriceo > couponExists.minAmount) {
                                resolve({ status: true,discountAmount: couponExists.discount })
                            } else {
                                resolve({ status: false, reason: " not enough money to apply coupon" })
                            }
                        } else {
                            resolve({ status: false, reason: " coupon has expired" })
                        }
                    } else {
                        resolve({ status: false, reason: "coupon does'nt exist" })
                    }
                } catch (error) {
                    console.log(error.message, ' err in unblocking user in couponHelpers + couponValidator');
                }
            })
        }
}