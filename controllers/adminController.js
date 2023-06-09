const producthelpers = require('../helpers/productHelpers');
const couponHelpers = require('../helpers/couponHelpers');
const chartHelpers = require('../helpers/chartHelpers');
const offerHelpers = require('../helpers/offerHelpers');
const adminHelpers = require('../helpers/adminHelpers');
const reportHelpers = require('../helpers/reportHelpers');
const bannerHelpers = require('../helpers/bannerHelpers');
const productHelpers = require('../helpers/productHelpers');


//admin login 
const adminloginget = async function (req, res, next) {
    if (req.session.adminloggedIn) {
        res.redirect('admin/adminpanel')
    } else {
        res.render('admin/adminLogin')
    }
}

const adminloginPost = async (req, res) => {
    adminHelpers.dologin(req.body).then((response) => {
        if (response.status) {
            req.session.adminloggedIn = true
            req.session.admin = response.admin
            res.redirect('admin/adminpanel')
        } else {
            res.redirect('/admin')
        }
    })
}
// admin logout
const getAdminLogout = async (req, res) => {
    try {
        req.session.adminloggedIn = false
        req.session.admin = null 
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message, ' error in admincontrollers + getAdminLogout ');
    }
}

// admin homepage
const adminPanelget = async function (req, res, next) {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    let activeUsersCount = await chartHelpers.totalUsers()

    let orderCount = await chartHelpers.totalOrders()

    let productsCount = await productHelpers.allProductsCount()

    let categoryCount = await productHelpers.allCategories()
    categoryCount = categoryCount.length

    let orders = await adminHelpers.getOrders()
    orders = orders.slice(0,4)  

    let totalUsers = await chartHelpers.totalUsers()

    let totalOrders = await chartHelpers.totalOrders()

    let paymentCOD = await chartHelpers.paymentCOD()

    let paymentPaypal = await chartHelpers.paymentPaypal()

    let months = await chartHelpers.monthlyOrders()

    let monthly = []
    for (let i = 0; i < 12; i++) {
        monthly[i] = 0;
    }
    months.forEach(elem => {
        monthly[elem._id - 1] = elem.count
    })

    res.render('admin/adminPanel', { layout: 'admin/adminLayout', formattedDate, activeUsersCount, orderCount, productsCount, categoryCount, orders,totalUsers, totalOrders, paymentCOD, paymentPaypal, months })
}

// All user details
const getUserDetails = async (req, res) => {
    adminHelpers.getAllUsers().then((userlist) => {
        res.render('admin/adminUserListing', { userlist, layout: 'admin/adminLayout' })
    })
}

// details of one user
const oneUser = async (req, res) => {
    adminHelpers.oneUser(req.query.id).then((response)=>{        
        res.render('admin/oneUser',{layout: 'admin/adminLayout',response})
    })
}

// rendern products page
const getProductManagement = async (req, res) => {
    producthelpers.getAllProducts().then((products) => {
        res.render('admin/productManagement', { products, layout: 'admin/adminLayout' })
    })
}

// render new product add page
const getAddProduct = async (req, res) => {
    productHelpers.allCategories().then((cat) => {
        if (cat) {
            res.render('admin/productAdd', { cat, layout: 'admin/adminLayout' })
        }
    })
}   

// add new product
const postAddProduct = (req, res) => {
    try {
        let data = {
            name: req.body.name,
            category: req.body.category,
            marketPrice: req.body.marketPrice,
            description: req.body.description,
            stock: req.body.stock
        }
        producthelpers.addproducts(data).then((insertedId) => {
            const imgName = insertedId;
            req.files?.image?.forEach((element, index) => {
                element.mv('./public/productImages/' + imgName + index + '.jpg', (err, done) => {
                    if (err) {
                        console.log(err, ' err in moving the image')
                    }
                })
            });
            res.redirect('/admin/productmanagement')
        })
    } catch (err) {
        console.log(err);
    }
}

// to edit one product
const getEditProduct = async (req, res) => {
    const id = req.query.id
    productHelpers.getOneProduct(id).then((pdts) => {
        productHelpers.allCategories().then((catD) => {
            if (pdts) {
                res.render('admin/editProducts', { product: pdts, cat: catD, layout: 'admin/adminLayout' })
            } else {
                res.redirect(' /admin/usermanagement')
            }
        })
    })
}

// edit one product
const postEditProduct = async (req, res) => {
    try {
        proId = req.query.id
        data = {
            name: req.body.name,
            marketPrice: req.body.marketPrice,
            description: req.body.description,
            category: req.body.category,
            stock: req.body.stock
        }
        productHelpers.updateProduct(proId, data).then(() => {
            res.redirect('/admin/productmanagement')
        })
    } catch (error) {
        console.log(error.message, ' error message from posting editproduct');
    }
}
const getDeleteProduct = async (req, res) => {
    delId = req.query.id
    productHelpers.deleteProduct(delId).then((deldata) => {
        res.redirect('/admin/productmanagement')
    })
}

// block user 
const postBlock = async (req, res) => {
    const id = req.query.id
    adminHelpers.getBlockOneUser(id).then(() => {
        res.redirect('/admin/userdetails')
    })
}

//  unblock user
const postUnblock = async (req, res) => {
    const id = req.query.id
    adminHelpers.getUnblockUser(id).then(() => {
        res.redirect('/admin/userdetails')
    })
}

// render all catefories page
const getcategories = async (req, res) => {
    productHelpers.allCategories().then((cat) => {
        res.render('admin/categories', { cat, layout: 'admin/adminLayout' })
    })
}

// render page to add new categories
const getAddCategories = async (req, res) => {
    res.render('admin/addCategories', { layout: 'admin/adminLayout' })
}

// add new category
const postAddCategories = async (req, res) => {
    let name = req.body
    productHelpers.addcategories(name).then((id) => {
        res.redirect('/admin/category')
    })
}

// delete one category 
const postdeleteCategory = async (req, res) => {
    let id = req.query.id
    productHelpers.deleteCategories(id).then((delcat) => {
        res.redirect('/admin/category')
    })
}

// show one category
const getOneCategory = (req, res) => {
    let id = req.query.id
    productHelpers.getOneCategory(id).then((catData) => {
        try {
            if (catData) {
                res.render('admin/editCategories', { catD: catData, layout: 'admin/adminLayout' })
            }
        } catch (error) {
            console.log(error.message, ' error in adminContrller + getOneCategory');
        }
    })
}

// edit one category
const postEditOneCategory = async (req, res) => {
    let catId = req.query.id
    let data = {
        category: req.body.category
    }
    productHelpers.updateCategory(catId, data).then((done) => {
        try {
            if (done) {
                res.redirect('/admin/category')
            }
        } catch (error) {
            console.log(error.message, ' eror in admincontroller + postEditOneCategory');
        }
    })
}
// render page to edit product image
const editImage = async (req, res) => {
    try {
        productHelpers.getOneProduct(req.query.id).then((products)=>{
            res.render('admin/editImage',{layout: 'admin/adminLayout', products})
        })
    } catch (error) {
        console.log(error.message,' error in admincontroller + editImage');
    }
}

// change cover image of product 
const changeCover = async (req, res) => {
    try {        
        productHelpers.changeCover(req.body.imageId,req.body.defaultId).then((response)=>{
            res.json({status:true})
        })
    } catch (error) {
        console.log(error.message,' error in admincontroller + changeCover');
    }
}

// show all orders
const getOrders = async (req, res) => {
    try {
        let orders = await adminHelpers.getOrders()
        res.render('admin/orders', { orders, layout: 'admin/adminLayout' })

    } catch (error) {
        console.log(error.message, ' in admincontrollers + getOrders ');
    }
}

//  approve order status
const getApprove = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const id = req.query.id
            await adminHelpers.getApprove(id).then((response) => {
                res.redirect('/admin/orders')
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + getApprove ');
        }
    })
}

// cancel order
const getCancel = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const id = req.query.id
            await adminHelpers.getCancel(id).then((response) => {
                res.redirect('/admin/orders')
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + getCancel ');
        }
    })
}

// order status
const getOrderStatus = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const id = req.query.id
            await adminHelpers.OrderStatus(id).then((response) => {
                res.redirect('/admin/orders')
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + postOrderStatus ');
        }
    })
}
//  sales - graphs
const salesGraphs = async (req, res) => {
    console.log(' in admincontrollers + salesGraphs ');
    try {
        let totalUsers = await chartHelpers.totalUsers()

        let totalOrders = await chartHelpers.totalOrders()

        let paymentCOD = await chartHelpers.paymentCOD()

        let paymentPaypal = await chartHelpers.paymentPaypal()

        let month = await chartHelpers.monthlyOrders()

        let monthly = []
        for (let i = 0; i < 12; i++) {
            monthly[i] = 0;
        }
        month.forEach(elem => {
            monthly[elem._id - 1] = elem.count
        })

        res.render('admin/salesReports', { totalUsers, totalOrders, monthly, paymentCOD, paymentPaypal, layout: 'admin/adminLayout' })
    } catch (error) {
        console.log(error.message, ' error in admincontrollers + salesGraphs ');
    }
}

// pdf of sales report
const sales_Docs = async (req, res) => {
    try {
        let newMonthy, newYearly

        let daily = await reportHelpers.dailySales()
        let newDaily = await reportHelpers.oneProduct(daily)

        let monthy = await reportHelpers.monthlySales()
        newMonthy = await reportHelpers.oneProduct(monthy)

        let yearly = await reportHelpers.yearlySales()
        newYearly = await reportHelpers.oneProduct(yearly)

        res.render('admin/sales_Docs', { layout: 'admin/adminLayout', newDaily, newMonthy, newYearly })
    } catch (error) {
        console.log(error.message, ' error in admincontrollers + sales_Docs ');
    }
}

// coupons
const geCoupons = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let allCoupon = await couponHelpers.getAllCoupon()
            res.render('admin/coupon', { allCoupon, layout: 'admin/adminLayout' })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + geCoupons ');
        }
    })
}

// add new coupons
const addCoupons = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            couponHelpers.addCoupon(req.body).then((response) => {
                res.json(response)
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + addCoupons ');
        }
    })
}

// delete coupons
const deleteCoupon = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let i = req.body.id
            couponHelpers.deleteCoupon(i).then((response) => {
                res.json(response)
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + deleteCoupon ');
        }
    })
}

// edit one coupon
const editCoupon = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let id = req.query.id
            let couponId = await couponHelpers.getOneCoupon(id)
            res.render('admin/editCoupons', { couponId, layout: 'admin/adminLayout' })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + editCoupon ');
        }
    })
}

// update edit
const postEditCoupon = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            couponHelpers.editCoupon(req.body).then((response) => {
                res.redirect('/admin/coupon-Managemnt')
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + postEditCoupon ');
        }
    })
}

// render banner page
const bannerPage = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            res.render('admin/bannerPage', { layout: 'admin/adminLayout'})
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + bannerPage ');
        }
    })
}

// show all banners
const banners = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let getbanner = await bannerHelpers.allBanners()
            res.render('admin/banner', { layout: 'admin/adminLayout', getbanner })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + banners ');
        }
    })
}

// add new banner
const addBanners = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            bannerHelpers.addBanner(req.body).then((insertedId) => {
                let imgName = insertedId
                req.files?.image?.mv('./public/banner-images/' + imgName + '.jpg', () => {
                    console.log('banner image done');
                })
                res.redirect('/admin/bannerManagements')
            })
        } catch (error) {
            console.log(error.message, ' error in admincontrollers + addBanners ');
        }
    })
}

// edit banner
const editBanner = async (req, res) => {
    try {
        bannerHelpers.getOneBanner(req.query.id).then((data) => {
            res.render('admin/editBanner', { layout: 'admin/adminLayout', data })
        })
    } catch (error) {
        console.log(error.message, ' error in admincontrollers + editBanner ');
    }
}

// edit is updated
const postEditBanner = async (req, res) => {
    try {
        
        let edit = await bannerHelpers.editBanner(req.body, req.query.id)
        
        let imgName = edit
        req.files?.image?.mv('./public/banner-images/' + imgName + '.jpg', () => {
            console.log('banner image done');
        })
        res.redirect('/admin/bannerManagements')
    } catch (error) {
        console.log(error.message, ' error in admincontrollers + postEditBanner ');
    }
}

// delete banner
const removeBanner = async (req, res) => {
    try {
        bannerHelpers.removeBanner(req.body).then((response) => {
            res.json(response)
        })
    } catch (error) {
        console.log(error.message, ' error in admincontrollers + removeBanner ');
    }
}

// sow offers
const offers = async (req,res)=>{
    try {
        let products = await productHelpers.getAllProducts()
        let onOffers = await offerHelpers.findAll()
        res.render('admin/offers', { layout: 'admin/adminLayout', products,onOffers})
            
        } catch (error) {
            console.log(error.message,' error in admincontrollers + offers ');
        }
}
// add new offers
const addOffers = async (req,res)=>{
    try {
            offerHelpers.addOffer(req.body).then((response)=>{
                res.redirect('/admin/offers', { layout: 'admin/adminLayout', })
            })
        } catch (error) {
            console.log(error.message,' error in admincontrollers + addOffers ');
        }
}

module.exports = {
    adminloginget,
    adminPanelget,
    adminloginPost,
    getAdminLogout,
    getUserDetails,
    oneUser,
    getProductManagement,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    getDeleteProduct,
    postBlock,
    postUnblock,
    getcategories,
    getAddCategories,
    postAddCategories,
    postdeleteCategory,
    getOneCategory,
    postEditOneCategory,
    editImage,
    changeCover,
    getOrders,
    getApprove,
    getCancel,
    getOrderStatus,
    salesGraphs,
    sales_Docs,
    geCoupons,
    addCoupons,
    deleteCoupon,
    editCoupon,
    postEditCoupon,
    bannerPage,
    banners,
    addBanners,
    editBanner,
    removeBanner,
    postEditBanner,
    offers,
    addOffers
}