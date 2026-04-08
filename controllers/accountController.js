const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  })
}

/* ****************************************
*  Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }
  res.render("account/update", {
    title: "Update Account",
    nav,
    updateErrors: null,
    passwordErrors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "",
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process account update request
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    parseInt(account_id)
  )

  if (updateResult) {
    // Refresh accountData in the JWT cookie with updated values
    const updatedAccount = await accountModel.getAccountById(parseInt(account_id))
    delete updatedAccount.account_password
    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.flash("notice", `Your account information has been updated successfully.`)
    res.locals.accountData = updatedAccount
    res.locals.loggedin = 1
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.render("account/update", {
      title: "Update Account",
      nav,
      updateErrors: null,
      passwordErrors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
  }
}

/* ****************************************
*  Process password change request
* *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  let hashedPassword
  try {
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password change.")
    const accountData = await accountModel.getAccountById(parseInt(account_id))
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      updateErrors: null,
      passwordErrors: null,
      account_firstname: accountData ? accountData.account_firstname : "",
      account_lastname: accountData ? accountData.account_lastname : "",
      account_email: accountData ? accountData.account_email : "",
      account_id,
    })
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, parseInt(account_id))

  if (updateResult) {
    req.flash("notice", "Your password has been changed successfully.")
    const updatedAccount = await accountModel.getAccountById(parseInt(account_id))
    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    res.locals.accountData = updatedAccount
    res.locals.loggedin = 1
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    const accountData = await accountModel.getAccountById(parseInt(account_id))
    res.render("account/update", {
      title: "Update Account",
      nav,
      updateErrors: null,
      passwordErrors: null,
      account_firstname: accountData ? accountData.account_firstname : "",
      account_lastname: accountData ? accountData.account_lastname : "",
      account_email: accountData ? accountData.account_email : "",
      account_id,
    })
  }
}

/* ****************************************
*  Process logout request
* *************************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

/* ****************************************
*  Deliver manage accounts view (Admin only)
* *************************************** */
async function buildManageAccounts(req, res, next) {
  let nav = await utilities.getNav()
  const accounts = await accountModel.getAllAccounts()
  res.render("account/manage-accounts", {
    title: "Manage Accounts",
    nav,
    errors: null,
    accounts,
  })
}

/* ****************************************
*  Process account type update (Admin only)
* *************************************** */
async function changeAccountType(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_type } = req.body
  const loggedInId = res.locals.accountData.account_id

  // Prevent admin from changing their own type
  if (parseInt(account_id) === parseInt(loggedInId)) {
    req.flash("notice", "You cannot change your own account type.")
    return res.redirect("/account/manage-accounts")
  }

  const result = await accountModel.updateAccountType(parseInt(account_id), account_type)

  if (result) {
    req.flash("notice", `Account updated to ${account_type} successfully.`)
  } else {
    req.flash("notice", "Update failed. The account may already be an Admin or does not exist.")
  }
  return res.redirect("/account/manage-accounts")
}

module.exports = { buildLogin, buildRegister, buildManagement, buildUpdate, registerAccount, accountLogin, updateAccount, updatePassword, accountLogout, buildManageAccounts, changeAccountType }