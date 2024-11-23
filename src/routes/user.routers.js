import {Router} from "express"
import { registerUser,loginUser,logoutUser,refreshAcessToken } from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyToken } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
             name:"coverImage",
             maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
// secure Routes
router.route("/logout").post(verifyToken,logoutUser)
router.route("/refresh-token").post(refreshAcessToken)
export default router 