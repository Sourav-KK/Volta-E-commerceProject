var express = require('express');
var router = express.Router();
const admincontroller = require('../controllers/adminController');
const { verifyAdminLogin } = require('../controllers/adminVerify');

const { adminloginget, adminloginPost, adminPanelget, getAdminLogout, getUserDetails, oneUser, getProductManagement, getAddProduct, postAddProduct, getEditProduct, postEditProduct, getDeleteProduct, editImage, changeCover, postBlock, postUnblock, getcategories, getAddCategories, postAddCategories, postdeleteCategory,getOneCategory, postEditOneCategory, geCoupons,bannerPage, banners, addBanners, removeBanner, offers, addOffers } = require('../controllers/adminController')

/* GET users listing. */

// Admin Login 
router.get('/', adminloginget);

router.post('/', adminloginPost)

router.get('/adminpanel', verifyAdminLogin, adminPanelget)

//adminlogout
router.get('/adminlogout', verifyAdminLogin, getAdminLogout)

// user details
router.get('/userdetails', verifyAdminLogin, getUserDetails)
router.get('/viewUser', verifyAdminLogin, oneUser)

/* ------------------------------------ product management  -------------------------------------- */
router.route('/productmanagement').get(verifyAdminLogin, getProductManagement)

router.route('/addproduct').get(verifyAdminLogin, getAddProduct)
.post(verifyAdminLogin, postAddProduct)


router.route('/editproduct').get(verifyAdminLogin, getEditProduct)
.post(verifyAdminLogin, postEditProduct)

router.route('/deleteproduct').get(verifyAdminLogin, getDeleteProduct)

router.route('/editImage').get( verifyAdminLogin, editImage)
                          .post(verifyAdminLogin, changeCover)
/* ------------------------------------ end -------------------------------------- */


// Block && Unblock
router.get('/block', verifyAdminLogin, postBlock)

router.get('/unblock', verifyAdminLogin, postUnblock)

/* ------------------------------------ product management  -------------------------------------- */
router.get('/category', getcategories)

router.route('/addcategories').get(getAddCategories)
  .post(postAddCategories)

router.get('/deletecategory', postdeleteCategory)

router.route('/editcategory').get(getOneCategory)
                              .post(postEditOneCategory)
/* ------------------------------------ end -------------------------------------- */


/* ------------------------------------ Order management  -------------------------------------- */
router.get('/orders', verifyAdminLogin, admincontroller.getOrders)

router.get('/approve', verifyAdminLogin, admincontroller.getApprove)

router.get('/cancel', verifyAdminLogin, admincontroller.getCancel)

router.get('/orderStatus', verifyAdminLogin, admincontroller.getOrderStatus)
/* ------------------------------------  end  -------------------------------------- */


router.get('/salesreport', verifyAdminLogin, admincontroller.salesGraphs)

router.get('/documents', verifyAdminLogin, admincontroller.sales_Docs)


/* -------------------------------------------------------------------------- */
/*                                coupon management                           */
/* -------------------------------------------------------------------------- */

router.get('/coupon-Managemnt', verifyAdminLogin, geCoupons)

router.post('/addcoupon', verifyAdminLogin, admincontroller.addCoupons)

router.delete('/removeCoupon', verifyAdminLogin, admincontroller.deleteCoupon)

router.route('/edit-One-coupon').get(verifyAdminLogin, admincontroller.editCoupon)
                                .post(verifyAdminLogin, admincontroller.postEditCoupon)


/* -------------------------------------------------------------------------- */
/*                                Banner management                           */
/* -------------------------------------------------------------------------- */
router.get('/bannerPage',verifyAdminLogin, bannerPage)

router.route('/bannerManagements').get(verifyAdminLogin, banners)
                            .post(verifyAdminLogin, addBanners)
                            .delete(verifyAdminLogin, removeBanner)

router.route('/edit-banner').get(verifyAdminLogin, admincontroller.editBanner)
                            .post(verifyAdminLogin, admincontroller.postEditBanner)

// offers 
router.route('/offers').get(verifyAdminLogin, offers)
                       .post(verifyAdminLogin, addOffers)

module.exports = router;
