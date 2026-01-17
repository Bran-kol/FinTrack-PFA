const pool = require('../config/database');

const getAllCategories = async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM categories WHERE user_id = ?';
    const params = [req.user.id];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY name ASC';

    const [categories] = await pool.execute(query, params);
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getCategory = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json({ category: categories[0] });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    // Check if category with same name exists for user
    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?',
      [req.user.id, name, type]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Category with this name already exists.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [req.user.id, name, type]
    );

    res.status(201).json({
      message: 'Category created successfully.',
      category: { id: result.insertId, user_id: req.user.id, name, type }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await pool.execute(
      'UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?',
      [name, type, req.params.id, req.user.id]
    );

    res.json({
      message: 'Category updated successfully.',
      category: { id: parseInt(req.params.id), user_id: req.user.id, name, type }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Check if category is used in transactions
    const [transactions] = await pool.execute(
      'SELECT id FROM transactions WHERE category_id = ?',
      [req.params.id]
    );

    if (transactions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category. It is used in transactions.' 
      });
    }

    await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
