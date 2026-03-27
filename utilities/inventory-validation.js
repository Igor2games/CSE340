const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/* *******************************
 * Classification validation rules
 * ****************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .bail()
      .matches(/^[A-Za-z]+$/)
      .withMessage("Classification name must contain alphabetic characters only and no spaces."),
  ]
}

/* *******************************
 * Check classification data
 * ****************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name,
    })
    return
  }

  next()
}

/* *******************************
 * Inventory validation rules
 * ****************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please choose a classification.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Classification value is invalid."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide a make.")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide a model.")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path.")
      .bail()
      .matches(/^\/images\/vehicles\/.+/)
      .withMessage("Image path must begin with /images/vehicles/"),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path.")
      .bail()
      .matches(/^\/images\/vehicles\/.+/)
      .withMessage("Thumbnail path must begin with /images/vehicles/"),

    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a price.")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price must be a number (integer or decimal)."),

    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide a year.")
      .bail()
      .matches(/^\d{4}$/)
      .withMessage("Year must be 4 digits."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide mileage.")
      .bail()
      .isInt({ min: 0 })
      .withMessage("Miles must contain digits only."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color."),
  ]
}

/* *******************************
 * Check inventory data
 * ****************************** */
validate.checkInventoryData = async (req, res, next) => {
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

  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors,
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
    return
  }

  next()
}

module.exports = validate
