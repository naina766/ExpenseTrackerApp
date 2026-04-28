const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error.message);
    res.status(500).json({ message: 'Unable to fetch expenses' });
  }
};

exports.addExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { amount, category, date, note } = req.body;

  try {
    const expense = new Expense({
      user: req.user.id,
      amount,
      category,
      date: date || Date.now(),
      note: note || ''
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error.message);
    res.status(500).json({ message: 'Unable to add expense' });
  }
};

exports.updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { amount, category, date, note } = req.body;

  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.amount = amount;
    expense.category = category;
    expense.date = date || expense.date;
    expense.note = note || expense.note;

    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error.message);
    res.status(500).json({ message: 'Unable to update expense' });
  }
};

exports.deleteExpense = async (req, res) => {
   console.log("DELETE API HIT");
  console.log("PARAM ID:", req.params.id);
  console.log("USER:", req.user?.id);
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error.message);
    res.status(500).json({ message: 'Unable to delete expense' });
  }
};
