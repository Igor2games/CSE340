const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  if (!data || data.length === 0) {
    return next({ status: 404, message: "Sorry, no matching vehicles could be found." })
  }
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId, 10)
  if (Number.isNaN(inv_id)) {
    return next({ status: 400, message: "Invalid inventory id." })
  }

  const data = await invModel.getInventoryByInvId(inv_id)
  if (!data) {
    return next({ status: 404, message: "Sorry, that vehicle was not found." })
  }

  const detail = await utilities.buildInventoryDetail(data)
  let nav = await utilities.getNav()
  const vehicleName = `${data.inv_make} ${data.inv_model}`

  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    detail,
  })
}

/* ***************************
 *  Trigger intentional 500 error
 * ************************** */
invCont.triggerIntentionalError = async function (req, res, next) {
  const error = new Error("Intentional 500 error for testing")
  error.status = 500
  throw error
}

module.exports = invCont