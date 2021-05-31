const express = require("express")
const router = express.Router()
const moviesController = require("../controllers/moviesController")
const moviesMiddleware = require("../middleware/moviesMiddleware")
const path = require("path");
const multer = require('multer');
const storage = multer.diskStorage({
	  destination:(req,file,cb)=>{
			cb(null,'public/images/moviesLogos');
	  },
	  filename:(req,file,cb)=>{
			cb(null,file.originalname.replace(path.extname(file.originalname), "") + '-' + Date.now() + path.extname(file.originalname));
		}
    });
const upload = multer({storage:storage});


router.get("/", moviesMiddleware.queryFilters, moviesController.getMovies)
router.get("/:id", moviesMiddleware.movieExists, moviesController.getMovie)
router.post("/", upload.any(), moviesMiddleware.movieValidation, moviesController.newMovie)
router.put("/:id", upload.any(), moviesMiddleware.movieExists, moviesMiddleware.movieValidation, moviesController.updateMovie)
router.delete("/:id", moviesMiddleware.movieExists, moviesController.deleteMovie)

module.exports = router;