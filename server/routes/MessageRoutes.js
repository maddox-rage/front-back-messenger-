import { Router } from "express";
import {
  addAudioMessage,
  addImageMessage,
  addMessage,
  getInitialContactsWithMessages,
  getMessages,
  deleteMessage,
  deleteAllMessage,
  unBlockUser,
  reportUser,
  deleteMessageByReciever
} from "../controllers/MessageController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/recordings/" });
const uploadImage = multer({ dest: "uploads/images/" });

const router = Router();


router.get("/get-messages/:from/:to", getMessages);
router.get("/get-initial-contacts/:from", getInitialContactsWithMessages);

router.post("/add-audio-message", upload.single("audio"), addAudioMessage);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);
router.post("/delete-all-message", deleteAllMessage);
router.post("/add-message", addMessage);
router.post("/unblock-user", unBlockUser)
router.post("/sent-report", reportUser)
router.post("/delete-message-by-reciever/:id",deleteMessageByReciever)


router.delete("/delete-message/:id", deleteMessage);



export default router;
