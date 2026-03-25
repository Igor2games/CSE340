// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build login view
router.get("/register", utilities.handleErrors(accountController.buildRegister));


// Intentional error route for testing error handling middleware
router.get("/trigger-error", utilities.handleErrors(accountController.triggerIntentionalError));

module.exports = router;