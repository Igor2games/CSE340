const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    classification_name: "",
  })
}

/* ***************************
 *  Add classification data
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const classificationResult = await invModel.addClassification(classification_name)

  if (classificationResult) {
    nav = await utilities.getNav()
    req.flash("success", `The ${classification_name} classification was added successfully.`)
    return res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  }

  req.flash("error", "Sorry, the classification was not added.")
  return res.status(501).render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    classification_name,
  })
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
  })
}

/* ***************************
 *  Add inventory data
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const invResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (invResult) {
    req.flash("success", `The ${inv_make} ${inv_model} was added successfully.`)
    return res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  }

  const classificationList = await utilities.buildClassificationList(classification_id)
  req.flash("error", "Sorry, the vehicle was not added.")
  return res.status(501).render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    errors: null,
    classificationList,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  })
}

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
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
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