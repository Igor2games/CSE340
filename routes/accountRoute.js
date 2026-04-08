// Needed Resources
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to build account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

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

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to build account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdate))

// Route to process account update form
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Route to process password change form
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Route to process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

// Route to build manage accounts view (Admin only)
router.get("/manage-accounts", utilities.checkAdmin, utilities.handleErrors(accountController.buildManageAccounts))

// Route to process account type change (Admin only)
router.post(
  "/manage-accounts",
  utilities.checkAdmin,
  regValidate.accountTypeRules(),
  regValidate.checkAccountTypeData,
  utilities.handleErrors(accountController.changeAccountType)
)

module.exports = router;