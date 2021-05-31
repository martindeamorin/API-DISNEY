const express = require("express");
const router = express.Router()
const charactersController = require("../controllers/charactersController")
const charactersMiddleware = require("../middleware/charactersMiddleware")
const path = require("path");
const multer = require('multer');
const storage = multer.diskStorage({
	  destination:(req,file,cb)=>{
			cb(null,'public/images/charactersLogos');
	  },
	  filename:(req,file,cb)=>{
			cb(null,file.originalname.replace(path.extname(file.originalname), "") + '-' + Date.now() + path.extname(file.originalname));
		}
    });
const upload = multer({storage:storage});


router.get("/", charactersMiddleware.queryFilters,charactersController.getCharacters)
router.get("/:id", charactersMiddleware.characterExists, charactersController.getCharacter)
router.post("/", upload.any(), charactersMiddleware.characterValidation, charactersController.newCharacter)
router.put("/:id", upload.any(), charactersMiddleware.characterExists, charactersMiddleware.characterValidation, charactersController.updateCharacter)
router.delete("/:id", charactersMiddleware.characterExists, charactersController.deleteCharacter)

module.exports = router;