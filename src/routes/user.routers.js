import {Router} from "express"
import { registerUser,loginUser,logoutUser,refreshAcessToken,changeCurrentPassword,getCurrentUser,updateUserInfo,updateUserAvatar,updateCoverImage,getWatchHistory,getUserChannelProfile } from "../controllers/user.controllers.js"
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
router.route("/change-password").patch(verifyToken,changeCurrentPassword)
router.route("/current-user").get(verifyToken,getCurrentUser)
router.route("/update-user-info").patch(verifyToken,updateUserInfo)
router.route("/update-user-avatar").patch(verifyToken,upload.single("avatar"),updateUserAvatar)
router.route("/update-cover-image").patch(verifyToken,upload.single("coverImage"),updateCoverImage)
router.route("/watch-history").get(verifyToken,getWatchHistory)
router.route("/channel-profile/:username").get(getUserChannelProfile)



export default router 