module.exports={
    verifyUserLogin: async(req,res,next)=>{
        console.log(' in userVerify + verifyUserLogin');
        if (req.session.loggedIn) {
            let we = req.session.loggedIn
            next()
        } else {
            res.redirect('/login')
        }
    }
}  