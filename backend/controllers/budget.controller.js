const pool = require('../config/database');

const getAllBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT b.*, c.name as category_name
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `;
    const params = [req.user.id];

    if (month && year) {
      query += ' AND b.month = ? AND b.year = ?';
      params.push(parseInt(month), parseInt(year));
    }

    query += ' ORDER BY b.year DESC, b.month DESC';

    const [budgets] = await pool.execute(query, params);

    // Get actual spending for each budget
    for (let budget of budgets) {
      let spentQuery = `
        SELECT COALESCE(SUM(amount), 0) as spent
        FROM transactions
        WHERE user_id = ? AND type = 'expense'
        AND MONTH(date) = ? AND YEAR(date) = ?
      `;
      const spentParams = [req.user.id, budget.month, budget.year];

      if (budget.category_id) {
        spentQuery += ' AND category_id = ?';
        spentParams.push(budget.category_id);
      }

      const [spentResult] = await pool.execute(spentQuery, spentParams);
      budget.spent = parseFloat(spentResult[0].spent);
      budget.remaining = parseFloat(budget.amount) - budget.spent;
      budget.percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    }

    res.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getBudget = async (req, res) => {
  try {
    const [budgets] = await pool.execute(
      `SELECT b.*, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (budgets.length === 0) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    const budget = budgets[0];

    // Get actual spending
    let spentQuery = `
      SELECT COALESCE(SUM(amount), 0) as spent
      FROM transactions
      WHERE user_id = ? AND type = 'expense'
      AND MONTH(date) = ? AND YEAR(date) = ?
    `;
    const spentParams = [req.user.id, budget.month, budget.year];

    if (budget.category_id) {
      spentQuery += ' AND category_id = ?';
      spentParams.push(budget.category_id);
    }

    const [spentResult] = await pool.execute(spentQuery, spentParams);
    budget.spent = parseFloat(spentResult[0].spent);
    budget.remaining = parseFloat(budget.amount) - budget.spent;
    budget.percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;

    res.json({ budget });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createBudget = async (req, res) => {
  try {
    const { amount, month, year, category_id } = req.body;

    // Check if budget already exists for this month/year/category
    let checkQuery = `
      SELECT id FROM budgets 
      WHERE user_id = ? AND month = ? AND year = ?
    `;
    const checkParams = [req.user.id, month, year];

    if (category_id) {
      checkQuery += ' AND category_id = ?';
      checkParams.push(category_id);
    } else {
      checkQuery += ' AND category_id IS NULL';
    }

    const [existing] = await pool.execute(checkQuery, checkParams);

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: 'Budget already exists for this period and category.' 
      });
    }

    // Verify category belongs to user if provided
    if (category_id) {
      const [categories] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?',
        [category_id, req.user.id]
      );

      if (categories.length === 0) {
        return res.status(400).json({ message: 'Invalid category.' });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO budgets (user_id, amount, month, year, category_id)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, amount, month, year, category_id || null]
    );

    const [newBudget] = await pool.execute(
      `SELECT b.*, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Budget created successfully.',
      budget: newBudget[0]
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { amount, month, year, category_id } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    // Verify category belongs to user if provided
    if (category_id) {
      const [categories] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?',
        [category_id, req.user.id]
      );

      if (categories.length === 0) {
        return res.status(400).json({ message: 'Invalid category.' });
      }
    }

    await pool.execute(
      `UPDATE budgets 
       SET amount = ?, month = ?, year = ?, category_id = ?
       WHERE id = ? AND user_id = ?`,
      [amount, month, year, category_id || null, req.params.id, req.user.id]
    );

    const [updated] = await pool.execute(
      `SELECT b.*, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [req.params.id]
    );

    res.json({
      message: 'Budget updated successfully.',
      budget: updated[0]
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    await pool.execute(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
};
