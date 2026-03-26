// Needed Resources
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build register view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to build successful registration view
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Intentional error route for testing error handling middleware
router.get("/trigger-error", utilities.handleErrors(accountController.triggerIntentionalError));

module.exports = router;