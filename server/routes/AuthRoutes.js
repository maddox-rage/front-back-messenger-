import { Router } from "express";
import {
  checkUser,
  generateToken,
  getAllUsers,
  onBoardUser,
  changeEmail,
  changeOtherInfo
} from "../controllers/AuthController.js";

const router = Router();

router.post("/check-user", checkUser);
router.post("/onBoardUser", onBoardUser);
router.post("/change-email", changeEmail);
router.post("/change-other-info", changeOtherInfo);


router.get("/get-contacts", getAllUsers);
router.get("/generate-token/:userId", generateToken);

export default router;
