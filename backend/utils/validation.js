const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters long')
    .matches(/(?=.*\d)/)
    .withMessage('Password must contain a number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const expenseValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Expense amount must be greater than zero'),
  body('category')
    .isIn(['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'])
    .withMessage('Category must be valid'),
  body('date').optional().isISO8601().toDate().withMessage('Date must be valid')
];

module.exports = {
  registerValidation,
  loginValidation,
  expenseValidation
};
