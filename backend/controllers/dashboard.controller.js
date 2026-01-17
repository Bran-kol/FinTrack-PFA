const pool = require('../config/database');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get solde (balance from solde table)
    const [soldeRecord] = await pool.execute(
      'SELECT * FROM solde WHERE user_id = ?',
      [userId]
    );

    const initialBalance = soldeRecord.length > 0 ? parseFloat(soldeRecord[0].initial_balance) : 0;
    const currentBalance = soldeRecord.length > 0 ? parseFloat(soldeRecord[0].current_balance) : 0;

    // Get total income and expenses (all time)
    const [incomeTotal] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = ? AND type = 'income'`,
      [userId]
    );

    const [expenseTotal] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense'`,
      [userId]
    );

    const totalIncome = parseFloat(incomeTotal[0].total);
    const totalExpense = parseFloat(expenseTotal[0].total);
    const balance = currentBalance; // Use solde table balance

    // Get monthly income and expenses
    const [monthlyIncome] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = ? AND type = 'income'
       AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, currentMonth, currentYear]
    );

    const [monthlyExpense] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = ? AND type = 'expense'
       AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, currentMonth, currentYear]
    );

    const monthlyExpenseAmount = parseFloat(monthlyExpense[0].total);

    // Get expenses by category for current month (for pie chart)
    const [expensesByCategory] = await pool.execute(
      `SELECT c.name as category, COALESCE(SUM(t.amount), 0) as amount
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.type = 'expense'
       AND MONTH(t.date) = ? AND YEAR(t.date) = ?
       GROUP BY c.id, c.name
       ORDER BY amount DESC`,
      [userId, currentMonth, currentYear]
    );

    // Get monthly expense evolution (last 6 months) for bar/line chart
    const monthlyEvolution = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const [monthData] = await pool.execute(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
         FROM transactions 
         WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
        [userId, month, year]
      );

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      monthlyEvolution.push({
        month: monthNames[month - 1],
        year: year,
        income: parseFloat(monthData[0].income),
        expense: parseFloat(monthData[0].expense)
      });
    }

    // Get recent transactions
    const [recentTransactions] = await pool.execute(
      `SELECT t.*, c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get budget status per category
    const [categoryBudgets] = await pool.execute(
      `SELECT b.*, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.month = ? AND b.year = ? AND b.category_id IS NOT NULL`,
      [userId, currentMonth, currentYear]
    );

    for (let budget of categoryBudgets) {
      const [spent] = await pool.execute(
        `SELECT COALESCE(SUM(amount), 0) as spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND category_id = ?
         AND MONTH(date) = ? AND YEAR(date) = ?`,
        [userId, budget.category_id, currentMonth, currentYear]
      );
      budget.spent = parseFloat(spent[0].spent);
      budget.remaining = parseFloat(budget.amount) - budget.spent;
      budget.percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    }

    res.json({
      balance,
      initialBalance,
      totalIncome,
      totalExpense,
      monthlyIncome: parseFloat(monthlyIncome[0].total),
      monthlyExpense: monthlyExpenseAmount,
      expensesByCategory,
      monthlyEvolution,
      recentTransactions,
      categoryBudgets,
      currentMonth,
      currentYear
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getDashboardData };
