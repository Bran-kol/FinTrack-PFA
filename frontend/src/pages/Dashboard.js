import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { getDashboardData } from '../services/dashboard.service';
import { updateInitialBalance } from '../services/solde.service';
import Modal from '../components/Modal';
import './Dashboard.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [initialBalanceInput, setInitialBalanceInput] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardData();
      setData(response);
      setInitialBalanceInput(response.initialBalance || 0);
    } catch (error) {
      toast.error('Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInitialBalance = async () => {
    setSavingBalance(true);
    try {
      await updateInitialBalance(parseFloat(initialBalanceInput) || 0);
      toast.success('Solde initial mis à jour');
      setShowBalanceModal(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Échec de la mise à jour du solde initial');
    } finally {
      setSavingBalance(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3>Échec du chargement</h3>
        <p>Veuillez rafraîchir la page</p>
      </div>
    );
  }

  // Pie chart data for expenses by category
  const pieChartData = {
    labels: data.expensesByCategory.map(item => item.category),
    datasets: [
      {
        data: data.expensesByCategory.map(item => item.amount),
        backgroundColor: [
          '#7c3aed',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#06b6d4',
          '#ec4899',
          '#8b5cf6',
          '#84cc16',
          '#f97316'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  // Bar chart data for monthly evolution
  const barChartData = {
    labels: data.monthlyEvolution.map(item => `${item.month}`),
    datasets: [
      {
        label: 'Revenus',
        data: data.monthlyEvolution.map(item => item.income),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        hoverBackgroundColor: '#10b981',
        borderRadius: 8,
        borderSkipped: false
      },
      {
        label: 'Dépenses',
        data: data.monthlyEvolution.map(item => item.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        hoverBackgroundColor: '#ef4444',
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 60, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return ` ${context.parsed.toLocaleString('fr-FR')} €`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          },
          callback: (value) => value.toLocaleString('fr-FR') + ' €'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <p className="text-muted">Vue d'ensemble de vos finances</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card balance clickable" onClick={() => setShowBalanceModal(true)}>
          <div className="summary-icon">💎</div>
          <div className="summary-content">
            <span className="summary-label">Solde Actuel</span>
            <span className={`summary-value ${data.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(data.balance)}
            </span>
            <span className="summary-subtitle clickable-hint">
              Initial: {formatCurrency(data.initialBalance || 0)} (cliquer pour modifier)
            </span>
          </div>
        </div>

        <div className="summary-card income">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <span className="summary-label">Revenus du Mois</span>
            <span className="summary-value positive">
              {formatCurrency(data.monthlyIncome)}
            </span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">📉</div>
          <div className="summary-content">
            <span className="summary-label">Dépenses du Mois</span>
            <span className="summary-value negative">
              {formatCurrency(data.monthlyExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card chart-card">
          <h3 className="card-title">Dépenses par Catégorie</h3>
          <div className="chart-container">
            {data.expensesByCategory.length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <div className="empty-state">
                <p>Aucune dépense ce mois-ci</p>
              </div>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="card-title">Évolution Mensuelle (6 derniers mois)</h3>
          <div className="chart-container">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      {data.categoryBudgets.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Budgets par Catégorie</h3>
          </div>
          <div className="category-budgets">
            {data.categoryBudgets.map(budget => (
              <div key={budget.id} className="category-budget-item">
                <div className="category-budget-header">
                  <span className="category-name">{budget.category_name}</span>
                  <span className={`category-status ${budget.percentage > 100 ? 'exceeded' : ''}`}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <div className="progress-bar small">
                  <div
                    className={`progress-fill ${budget.percentage > 100 ? 'exceeded' : budget.percentage > 80 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transactions Récentes</h3>
          <Link to="/transactions" className="btn btn-sm btn-secondary">
            Voir Tout
          </Link>
        </div>
        {data.recentTransactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.category_name}</td>
                    <td>{transaction.description || '-'}</td>
                    <td className={`text-right ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Aucune transaction</p>
            <Link to="/transactions" className="btn btn-primary btn-sm mt-3">
              Ajouter une Transaction
            </Link>
          </div>
        )}
      </div>

      {/* Initial Balance Modal */}
      <Modal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        title="Définir le Solde Initial"
      >
        <div className="initial-balance-form">
          <p className="text-muted mb-3">
            Définissez votre solde de départ. C'est votre solde avant l'enregistrement des transactions.
          </p>
          <div className="form-group">
            <label>Solde Initial</label>
            <input
              type="number"
              value={initialBalanceInput}
              onChange={(e) => setInitialBalanceInput(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowBalanceModal(false)}
              style={{ flex: 1 }}
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpdateInitialBalance}
              disabled={savingBalance}
              style={{ flex: 1 }}
            >
              {savingBalance ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
