const express = require("express");
const router = express.Router();
const ctrlContact = require("../../models/contacts");
const {
  validateContact,
  validateStatusContact,
  validateId,
} = require("./validation");


router.get("/", ctrlContact.get);

router.get("/:contactId", validateId, ctrlContact.getById);

router.post("/", validateContact, ctrlContact.add);

router.put("/:contactId", [validateId, validateContact], ctrlContact.update);

router.delete("/:contactId", [validateId, validateContact], ctrlContact.remove);

router.patch(
  "/:contactId/favorite",
  [validateId, validateStatusContact],
  ctrlContact.favorite
);

module.exports = router;