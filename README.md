# FinTrack - Personal Finance Tracker

A full-stack personal finance management application built with React, Node.js, Express, and MySQL.

## Features

- 🔐 **User Authentication** - Secure JWT-based registration and login
- 📊 **Dashboard** - Overview of balance, income, expenses, and spending by category
- 💳 **Transactions** - Track income and expenses with category classification
- 🎯 **Budget Management** - Set monthly budgets (total and per category)
- 📈 **Data Visualization** - Charts for expenses by category and monthly trends
- 💰 **Balance Tracking** - Set initial balance and track current balance

## Tech Stack

- **Frontend**: React 18, React Router, Chart.js, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Project Structure

```
PFA/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── budget.controller.js
│   │   ├── category.controller.js
│   │   ├── dashboard.controller.js
│   │   └── transaction.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── budget.routes.js
│   │   ├── category.routes.js
│   │   ├── dashboard.routes.js
│   │   └── transaction.routes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── database/
    └── schema.sql
```

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Start MySQL server
2. Connect to MySQL:
   ```bash
   mysql -u root -p
   ```
3. Run the schema script:
   ```sql
   source C:/PFA/database/schema.sql
   ```
   Or copy and paste the contents of `database/schema.sql` into MySQL.

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=pfa_db
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=7d
   ```
   **Important**: Change `DB_PASSWORD` to your MySQL password and `JWT_SECRET` to a secure random string.

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## Usage

1. **Register**: Create a new account with name, email, and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your financial overview with charts
4. **Transactions**: Add, edit, and delete income/expense transactions
5. **Budget**: Set monthly budgets (total or per category)
6. **Categories**: Manage custom categories for transactions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get single budget
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Dashboard
- `GET /api/dashboard` - Get dashboard data (protected)

## Default Categories

When a user registers, the following default categories are created:

**Expense Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Health & Fitness
- Travel
- Education
- Other Expense

**Income Categories:**
- Salary
- Freelance
- Investments
- Other Income

## Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days (configurable)
- All data is scoped per authenticated user
- Protected routes require valid JWT token

## License

MIT
