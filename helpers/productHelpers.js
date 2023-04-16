const { response } = require('express');
const db = require('../config/connection');
const fs = require('fs');
const { log } = require('console');
const { ObjectID } = require('bson');

module.exports = {
    addproducts: (product) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.products(product)
            console.log(data + " inside then of addproducts, in products helpers");
            data.save()
            resolve(data._id)
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.products.find({})
                console.log(products, "in productHelpers + getAllProducts")
                resolve(products)
            } catch (error) {
                console.log(error, ' error in fetching products database');
            }
        })
    },
    allProductsCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                db.products.find({}).count().then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log(error, ' error in productHelpers + allProductsCount');
            }
        })
    },
    getOneProduct: (proId) => {
        console.log(' in productHelpers + getOneProduct');
        console.log(proId, ' proId in productHelpers + getOneProduct');

        return new Promise(async (resolve, reject) => {
            try {
                await db.products.findById({ _id: proId }).then((product) => {
                    console.log(product, ' this is the resolved product');
                    resolve(product)
                })
            } catch (error) {
                console.log(error.message, " error in getOneProduct");
            }
        })
    },
    updateProduct: (proId, data) => {
        console.log(proId, " proid in updateproducts ");
        console.log(data, ' data in updateproducts');
        return new Promise(async (resolve, reject) => {
            try {
                const updt = await db.products.findByIdAndUpdate({ _id: proId },
                    {
                        $set:
                        {
                            name: data.name,
                            marketPrice: data.marketPrice,
                            description: data.description,
                            category: data.category,
                            stock: data.stock
                        }
                    })
                resolve(updt)
                console.log(updt, ' value of updtt');
            } catch (error) {
                console.log(error.message, ' error while editing product');
            }
        })
    },

    deleteProduct: (id) => {
        console.log(` inside deleteProduct in productHelpers with product id: ${id}`);
        return new Promise(async (resolve, reject) => {
            try {
                for (let i = 0; i < 4; i++) {
                    let fileNameWithPath = `./public/productImages/${id}${i}.jpg`
                    try {
                        if (fs.existsSync(fileNameWithPath)) {
                            console.log(' fileNameWithPath exists ');
                            fs.unlink(fileNameWithPath);
                        }
                    } catch (error) {
                        console.log(error.message, ' error in deleting the images from location');
                    }
                }
                await db.products.deleteOne({ _id: id }).then((del) => {
                    resolve(del)
                    console.log(' data deleted succefully ');
                })
            } catch (error) {
                console.log(error, ' error in deleteProduct');
            }
        })
    },
    // chaning cover image of products
    changeCover: (neww, old) => {
        console.log(neww, ' neww in productHelpers + changeCover');
        console.log(old, ' old in productHelpers + changeCover');
        return new Promise(async (resolve, reject) => {
            try {
                let newDefaultPath = `./public/productImages/${neww}.jpg`;
                let defaultPath = `./public/productImages/${old}.jpg`;

                // Get the current names of the images
                const defaultName = defaultPath.split('/').pop();
                const newDefaultName = newDefaultPath.split('/').pop();

                // Check if the file with the new name already exists
                if (fs.existsSync(newDefaultPath)) {
                    // If it does, rename it to a temporary name
                    fs.renameSync(newDefaultPath, `./public/productImages/temp-${newDefaultName}`);
                }

                // Rename the images asynchronously
                fs.rename(defaultPath, newDefaultPath, (err) => {
                    if (err) {
                        console.log(err.message, ' error in renaming', defaultPath, ' to ', newDefaultPath);
                        reject(err);
                    } else {
                        // Rename the temporarily named file to the old name if it exists
                        if (fs.existsSync(`./public/productImages/temp-${newDefaultName}`)) {
                            fs.renameSync(`./public/productImages/temp-${newDefaultName}`, `./public/productImages/${defaultName}`);
                        }
                        console.log('Images swapped successfully.');
                        resolve();
                    }
                });
            } catch (error) {
                console.log(error.message, ' error in fetching categories from database');
                reject(error);
            }
        });
    },

    allCategories: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categories = await db.categories.find({})
                resolve(categories)
            } catch (error) {
                console.log(error.message, ' error in fetching categories from database');
            }
        })
    },
    categoryCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let categories = await db.categories.find({})
                resolve(categories)
            } catch (error) {
                console.log(error.message, ' error in fetching categories from database');
            }
        })
    },
    addcategories: (catData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = db.categories(catData)
                console.log(`${data}: category added successfullly `)
                data.save()
                resolve(data._id)
            } catch (error) {
                console.log(error.message, ' error in adding categories in addCategories');
            }
        })
    },
    deleteCategories: (id) => {
        console.log(' inside deleteCategories in productHelpers');
        return new Promise(async (resolve, reject) => {
            try {
                await db.categories.deleteOne({ _id: id }).then((del) => {
                    console.log(` successfully deleted the category ${id}`);
                    resolve(del)
                })
            } catch (error) {
                console.log(error.message, ' error in deleting categories');
            }
        })
    },
    getOneCategory: (id) => {
        console.log(' in productHelpers+editCategory with id:', id);
        return new Promise(async (resolve, reject) => {
            try {
                await db.categories.findById({ _id: id }).then((data) => {
                    console.log(` obtained product in editOneCategory is ${data}`);
                    resolve(data)
                })
            } catch (error) {
                console.log(error.message, ' error in editing category');
            }
        })
    },
    updateCategory: (catId, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.categories.updateOne({ _id: catId }, { category: data.category }).then((done) => {
                    console.log(' category successfully updated');
                    resolve(done)
                })
            } catch (error) {
                console.log(error.message, ' error in updating category');
            }
        })
    },

    // inventory
    decreasePdtQuantity: (prod) => {
        console.log(prod, ' prod in userHelpers + decreaseQuantity');
        return new Promise(async (resolve, reject) => {
            try {
                for (let i = 0; i < prod.length; i++) {
                    await db.products.updateOne(
                        {
                            _id: ObjectID(prod[i].products)
                        },
                        {
                            $inc: { stock: -prod[i].quantity }
                        }
                    )
                }
                resolve()
            } catch (error) {
                console.log(error.message, ' error in  userHelpers + decreaseQuantity');
            }
        })
    }


}