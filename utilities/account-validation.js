const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a first name."),
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a last name."),
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an email address.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      })

      .normalizeEmail(), // refer to validator.js docs
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Please provide a password.")
        .bail()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an email address.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password.")
      .bail()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check login data and return errors or continue to login process
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
  *  Account Update Data Validation Rules
  * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an email address.")
      .bail()
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email, { req }) => {
        const account_id = parseInt(req.body.account_id)
        const existingAccount = await accountModel.getAccountById(account_id)
        if (existingAccount && existingAccount.account_email !== account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email already in use. Please use a different email.")
          }
        }
      }),
  ]
}

/* ******************************
 * Check account update data and return errors or continue
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      updateErrors: errors.array(),
      passwordErrors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
    return
  }
  next()
}

/*  **********************************
  *  Password Update Validation Rules
  * ********************************* */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password.")
      .bail()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check password update data and return errors or continue
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(parseInt(account_id))
    res.render("account/update", {
      title: "Update Account",
      nav,
      updateErrors: null,
      passwordErrors: errors.array(),
      account_firstname: accountData ? accountData.account_firstname : "",
      account_lastname: accountData ? accountData.account_lastname : "",
      account_email: accountData ? accountData.account_email : "",
      account_id,
    })
    return
  }
  next()
}

/*  **********************************
  *  Account Type Update Validation Rules
  * ********************************* */
validate.accountTypeRules = () => {
  return [
    body("account_id")
      .trim()
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Invalid account."),

    body("account_type")
      .trim()
      .notEmpty()
      .isIn(["Client", "Employee", "Admin"])
      .withMessage("Invalid account type selected."),
  ]
}

/* ******************************
 * Check account type update data
 * ***************************** */
validate.checkAccountTypeData = async (req, res, next) => {
  const { account_id, account_type } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const accounts = await accountModel.getAllAccounts()
    res.render("account/manage-accounts", {
      title: "Manage Accounts",
      nav,
      errors: errors.array(),
      accounts,
    })
    return
  }
  next()
}

module.exports = validate