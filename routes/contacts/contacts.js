const express = require('express');
const router = express.Router();
const {
  getContacts,
  getContact,
  addContact,
  updateContact,
  updateStatusContact,
  deleteContact,
} = require("../../controllers/contact");
const {
  validateContact,
  validateUpdateContact,
  validateStatusContact,
  validateId,
} = require("./validation");

const guard = require('../../helpers/guard');

router.get('/', guard, getContacts);

router.get('/:id', guard, validateId, getContact);

router.post('/', guard, validateContact, addContact);

router.delete('/:id', guard, validateId, deleteContact);

router.put(
    '/:id',
    guard,
    [(validateId, validateContact)],
    updateContact
);

router.patch(
    '/:id/vaccinated/',
    guard,
    [(validateId, validateStatusContact)],
    updateStatusContact
);

router.patch(
    "/:contactId",
    guard,
    [(validateId, validateUpdateContact)],
    updateContact
);

module.exports = router;
