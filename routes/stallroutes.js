const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const stallController = require("../controllers/stallController"); 

router.post(
    "/add",
    auth,
    upload.single("image"),
    stallController.addStall
);

router.get("/", stallController.getStallsPaginated);

router.get("/:id", stallController.getStallById);

router.post("/:id/react", stallController.reactToStall);

router.post("/:id/report", auth, stallController.reportStall);


module.exports = router;
