

const express = require("express")
const router = express.Router()
const { auth, admin } = require("../middleware/auth")
const controller = require("../controllers/jobsController");
const {  createJob,getJobs } = controller


// router.get("/:user", auth, admin, getOngoingOnboarding);
router.get('/',auth,admin,getOnboardingPersonas);

router.post("/create",  createJob);

router.post("/find", getJobs);

router.put("/apply", auth, admin, updateOnboardingPersona);

router.put("/", auth, admin, updateOnboardStatus)


module.exports = router
