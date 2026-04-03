// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Route to process add classification form
router.post(
	"/add-classification",
	utilities.checkAccountType,
	invValidate.classificationRules(),
	invValidate.checkClassificationData,
	utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Route to process add inventory form
router.post(
	"/add-inventory",
	utilities.checkAccountType,
	invValidate.inventoryRules(),
	invValidate.checkInventoryData,
	utilities.handleErrors(invController.addInventory)
);

// Route to process update inventory form
router.post(
	"/update/",
	utilities.checkAccountType,
	invValidate.newInventoryRules(),
	invValidate.checkUpdateData,
	utilities.handleErrors(invController.updateInventory)
);

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to return inventory items as JSON for management view
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));

// Route to build delete confirmation view
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteConfirm));

// Route to process inventory delete request
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryItem));

// Intentional error route for testing error handling middleware
router.get("/trigger-error", utilities.handleErrors(invController.triggerIntentionalError));

module.exports = router;