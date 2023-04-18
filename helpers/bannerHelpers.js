const db = require('../config/connection');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const { ifError } = require('assert');

module.exports = {
    
    addBanner:(data)=>{
        return new Promise(async (resolve, reject)=>{
            try {
                let banner = await db.banner(data).save()
                resolve(banner._id)
            } catch (error) {
                 console.log(error.message, ' err in bannerHelpers + addBanners');
            }
        })
    },
    getBanner: (id) => {
        return new Promise((resolve, reject) => {
            try {
                db.banner.find({ _id: id }).then((data) => {
                    resolve(data)
                })
            } catch (error) {
                console.log(error.message, ' err in bannerHelpers + getBanner');
            }
        })
    },
    
    allBanners:()=>{
        return new Promise(async (resolve, reject)=>{
            try {
                db.banner.find({}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                 console.log(error.message, ' err in bannerHelpers + allBanners');
            }
        })
    },

    getOneBanner:(id)=>{
        return new Promise(async (resolve, reject)=>{
            try {
                db.banner.findOne({_id: new ObjectId(id)}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                 console.log(error.message, ' err in bannerHelpers + getOneBanner');
            }
        })
    },

    removeBanner:(ban)=>{
        // console.log(ban.bannerId,'ban.bannerId in bannerHelpers + removeBanner');
        return new Promise(async (resolve, reject)=>{
            try {
                db.banner.findOneAndRemove({_id:new ObjectId(ban.bannerId)}).then(()=>{
                    let fileNameWithPath = `./public/banner-images/${ban.bannerId}.jpg`
                        if (fs.existsSync(fileNameWithPath)) {
                            fs.unlink(fileNameWithPath, (err) => {
                                console.log(err);
                            });
                        }
                        resolve({status:true,message:' Banner successfully removed'})
                })
            } catch (error) {
                 console.log(error.message, ' err in bannerHelpers + removeBanner');
            }
        })
    },
    
    editBanner:(data,bannerId)=>{
        return new Promise(async (resolve, reject)=>{
            try {
                await db.banner.updateOne(
                    {
                        _id:new ObjectId(bannerId)
                    },{
                        $set:{
                            title:data.title,
                            description:data.description
                        }
                    }).then(()=>{

                        let fileNameWithPath = `./public/banner-images/${bannerId}.jpg`
    
                        if (fs.existsSync(fileNameWithPath)) {
                            fs.unlink(fileNameWithPath, (err) => {
                                console.log(err);
                            });
                        }
                        resolve(bannerId)
                    })
            } catch (error) {
                 console.log(error.message, ' err in bannerHelpers + editBanner');
            }
        })
    },
}
