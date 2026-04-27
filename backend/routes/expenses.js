const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { expenseValidation } = require('../utils/validation');

router.use(auth);
router.get('/', getExpenses);
router.post('/', expenseValidation, addExpense);
router.put('/:id', expenseValidation, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
