module.exports={
    verifyAdminLogin: async(req,res,next)=>{
        if (req.session.adminloggedIn) {
            let we = req.session.adminloggedIn
            next()
        } else {
            res.redirect('/admin')
        }
    }
}  