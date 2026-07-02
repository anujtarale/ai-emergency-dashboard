import express from 'express';
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact
} from '../controllers/contactController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect, getContacts)
  .post(protect, addContact);

router.route('/:id')
  .put(protect, updateContact)
  .delete(protect, deleteContact);

export default router;
