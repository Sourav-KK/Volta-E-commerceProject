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
        console.log('in couponHelpers + deleteCoupon');
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
        console.log('in couponHelpers + getOneCoupon');
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
        console.log(data,'in couponHelpers + editCoupon');
        
        console.log(data.couponCode,'in couponHelpers + editCoupon');
        console.log(data.discount,'in couponHelpers + editCoupon');
        console.log(data.minAmount,'in couponHelpers + editCoupon');
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
                        console.log(response,'response in couponHelpers + editCoupon');
                        
                    resolve(response)
                })
            } catch (error) {
                console.log(error.message, ' err in unblocking user in couponHelpers + editCoupon');
            }
        })
    },
    checkCoupon:(codeo)=>{
        console.log('in couponHelpers + checkCoupon');
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
            console.log('in couponHelpers + couponValidator');
            return new Promise(async (resolve, reject)=>{
                try {
                    let couponExists = await db.coupon.findOne({code:codeo})
                    console.log(couponExists,'couponExists in couponHelpers + couponValidator');

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

    // xxx:()=>{
    //     console.log('in couponHelpers + xxx');
    //     return new Promise(async (resolve, reject)=>{
    //         try {
    //         } catch (error) {
    //              console.log(error.message, ' err in unblocking user in couponHelpers + xxx');
    //         }
    //     })
    // }
}