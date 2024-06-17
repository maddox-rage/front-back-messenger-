import { Router } from "express";
import {getAllusers, getAllReports, getAllMessages, getAllBlockedUsers, blockUserByAdmin, getCounts} from "../controllers/AdminController.js";

const router = Router();


router.get("/get-users", getAllusers);
router.get("/get-reports", getAllReports);
router.get("/get-messages", getAllMessages);
router.get("/get-blocked-users", getAllBlockedUsers);
router.get("/get-counts", getCounts)

router.post("/block-user", blockUserByAdmin)

export default router;
