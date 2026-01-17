const pool = require('../config/database');

const getSolde = async (req, res) => {
  try {
    const [solde] = await pool.execute(
      'SELECT * FROM solde WHERE user_id = ?',
      [req.user.id]
    );

    if (solde.length === 0) {
      // Create solde record if not exists
      await pool.execute(
        'INSERT INTO solde (user_id, initial_balance, current_balance) VALUES (?, 0, 0)',
        [req.user.id]
      );
      return res.json({ 
        solde: { 
          user_id: req.user.id, 
          initial_balance: 0, 
          current_balance: 0 
        } 
      });
    }

    res.json({ solde: solde[0] });
  } catch (error) {
    console.error('Get solde error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateInitialBalance = async (req, res) => {
  try {
    const { initial_balance } = req.body;

    // Check if solde exists
    const [existing] = await pool.execute(
      'SELECT * FROM solde WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length === 0) {
      // Create new solde
      await pool.execute(
        'INSERT INTO solde (user_id, initial_balance, current_balance) VALUES (?, ?, ?)',
        [req.user.id, initial_balance, initial_balance]
      );
    } else {
      // Calculate difference and update current balance
      const oldInitial = parseFloat(existing[0].initial_balance);
      const currentBalance = parseFloat(existing[0].current_balance);
      const newInitial = parseFloat(initial_balance);
      const difference = newInitial - oldInitial;
      const newCurrentBalance = currentBalance + difference;

      await pool.execute(
        'UPDATE solde SET initial_balance = ?, current_balance = ? WHERE user_id = ?',
        [newInitial, newCurrentBalance, req.user.id]
      );
    }

    const [updated] = await pool.execute(
      'SELECT * FROM solde WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ 
      message: 'Initial balance updated successfully.',
      solde: updated[0] 
    });
  } catch (error) {
    console.error('Update initial balance error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const recalculateBalance = async (req, res) => {
  try {
    // Get initial balance
    const [soldeRecord] = await pool.execute(
      'SELECT initial_balance FROM solde WHERE user_id = ?',
      [req.user.id]
    );

    const initialBalance = soldeRecord.length > 0 ? parseFloat(soldeRecord[0].initial_balance) : 0;

    // Calculate from transactions
    const [income] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income'`,
      [req.user.id]
    );

    const [expense] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense'`,
      [req.user.id]
    );

    const totalIncome = parseFloat(income[0].total);
    const totalExpense = parseFloat(expense[0].total);
    const currentBalance = initialBalance + totalIncome - totalExpense;

    // Update solde
    if (soldeRecord.length === 0) {
      await pool.execute(
        'INSERT INTO solde (user_id, initial_balance, current_balance) VALUES (?, 0, ?)',
        [req.user.id, currentBalance]
      );
    } else {
      await pool.execute(
        'UPDATE solde SET current_balance = ? WHERE user_id = ?',
        [currentBalance, req.user.id]
      );
    }

    const [updated] = await pool.execute(
      'SELECT * FROM solde WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ 
      message: 'Balance recalculated successfully.',
      solde: updated[0] 
    });
  } catch (error) {
    console.error('Recalculate balance error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Helper function to update balance after transaction changes
const updateBalanceAfterTransaction = async (userId, type, amount, isDelete = false, isUpdate = false, oldAmount = 0, oldType = null) => {
  try {
    const [soldeRecord] = await pool.execute(
      'SELECT current_balance FROM solde WHERE user_id = ?',
      [userId]
    );

    let currentBalance = soldeRecord.length > 0 ? parseFloat(soldeRecord[0].current_balance) : 0;

    if (isUpdate && oldType && oldAmount) {
      // Reverse old transaction
      if (oldType === 'income') {
        currentBalance -= parseFloat(oldAmount);
      } else {
        currentBalance += parseFloat(oldAmount);
      }
    }

    if (isDelete) {
      // Reverse the transaction
      if (type === 'income') {
        currentBalance -= parseFloat(amount);
      } else {
        currentBalance += parseFloat(amount);
      }
    } else {
      // Apply the transaction
      if (type === 'income') {
        currentBalance += parseFloat(amount);
      } else {
        currentBalance -= parseFloat(amount);
      }
    }

    if (soldeRecord.length === 0) {
      await pool.execute(
        'INSERT INTO solde (user_id, initial_balance, current_balance) VALUES (?, 0, ?)',
        [userId, currentBalance]
      );
    } else {
      await pool.execute(
        'UPDATE solde SET current_balance = ? WHERE user_id = ?',
        [currentBalance, userId]
      );
    }

    return currentBalance;
  } catch (error) {
    console.error('Update balance error:', error);
    throw error;
  }
};

module.exports = { 
  getSolde, 
  updateInitialBalance, 
  recalculateBalance,
  updateBalanceAfterTransaction 
};
