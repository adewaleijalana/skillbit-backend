const express = require("express")
const router = express.Router()
const { auth, admin } = require("../middleware/auth")
const controller = require("../controllers/onboardController/onboardController");
const {  updateOnboardStatus,createOnboardingPersona,getOnboardingPersonas,updateOnboardingPersona } = controller


// router.get("/:user", auth, admin, getOngoingOnboarding);

router.get('/',auth,admin,getOnboardingPersonas);

router.post('/payment',getOnboardingPersonas);

router.post("/update", auth, admin, updateOnboardStatus);

router.post("/initiate", auth, admin, createOnboardingPersona);

router.put("/update", auth, admin, updateOnboardingPersona);

router.put("/", auth, admin, updateOnboardStatus)


module.exports = router
