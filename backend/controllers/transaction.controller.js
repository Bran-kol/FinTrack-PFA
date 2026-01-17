const pool = require('../config/database');
const { updateBalanceAfterTransaction } = require('./solde.controller');

const getAllTransactions = async (req, res) => {
  try {
    const { month, year, type, category_id } = req.query;
    let query = `
      SELECT t.*, c.name as category_name, c.type as category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];

    if (month && year) {
      query += ' AND MONTH(t.date) = ? AND YEAR(t.date) = ?';
      params.push(parseInt(month), parseInt(year));
    }

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(parseInt(category_id));
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    const [transactions] = await pool.execute(query, params);
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const [transactions] = await pool.execute(
      `SELECT t.*, c.name as category_name 
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    res.json({ transaction: transactions[0] });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { amount, date, category_id, type, description } = req.body;

    // Verify category belongs to user
    const [categories] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [category_id, req.user.id]
    );

    if (categories.length === 0) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO transactions (user_id, amount, date, category_id, type, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, amount, date, category_id, type, description || null]
    );

    const [newTransaction] = await pool.execute(
      `SELECT t.*, c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    // Update solde
    await updateBalanceAfterTransaction(req.user.id, type, amount);

    res.status(201).json({
      message: 'Transaction created successfully.',
      transaction: newTransaction[0]
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { amount, date, category_id, type, description } = req.body;

    // Verify transaction belongs to user and get old values
    const [existing] = await pool.execute(
      'SELECT id, amount, type FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const oldAmount = existing[0].amount;
    const oldType = existing[0].type;

    // Verify category belongs to user
    const [categories] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [category_id, req.user.id]
    );

    if (categories.length === 0) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    await pool.execute(
      `UPDATE transactions 
       SET amount = ?, date = ?, category_id = ?, type = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      [amount, date, category_id, type, description || null, req.params.id, req.user.id]
    );

    const [updated] = await pool.execute(
      `SELECT t.*, c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    // Update solde (reverse old, apply new)
    await updateBalanceAfterTransaction(req.user.id, type, amount, false, true, oldAmount, oldType);

    res.json({
      message: 'Transaction updated successfully.',
      transaction: updated[0]
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id, amount, type FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const { amount, type } = existing[0];

    await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    // Update solde (reverse the transaction)
    await updateBalanceAfterTransaction(req.user.id, type, amount, true);

    res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
