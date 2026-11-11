import { Router } from "express";

import { chatController } from "../controllers/chat.controllers.js";
import { validateChatBody } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/", validateChatBody, chatController);

export default router;
