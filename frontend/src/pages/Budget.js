import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getBudgets, deleteBudget } from '../services/budget.service';
import { getCategories } from '../services/category.service';
import Modal from '../components/Modal';
import BudgetForm from '../components/BudgetForm';
import './Budget.css';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString()
  });

  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y.toString());
  }

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        getBudgets(filters),
        getCategories()
      ]);
      setBudgets(budgetsRes.budgets || []);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      toast.error('Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setShowModal(true);
  };

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBudget(budgetToDelete.id);
      toast.success('Budget supprimé');
      fetchData();
    } catch (error) {
      toast.error('Échec de la suppression');
    } finally {
      setShowDeleteConfirm(false);
      setBudgetToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedBudget(null);
    fetchData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Calculate overview stats
  const overview = budgets.reduce(
    (acc, b) => {
      acc.totalBudget += parseFloat(b.amount);
      acc.totalSpent += parseFloat(b.spent || 0);
      return acc;
    },
    { totalBudget: 0, totalSpent: 0 }
  );
  overview.remaining = overview.totalBudget - overview.totalSpent;
  overview.percentage = overview.totalBudget > 0
    ? Math.round((overview.totalSpent / overview.totalBudget) * 100)
    : 0;

  const getMonthLabel = () => {
    const monthObj = months.find(m => m.value === filters.month);
    return monthObj ? monthObj.label : '';
  };

  return (
    <div className="budget-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Budgets</h1>
          <p className="text-muted">Planifiez et suivez vos budgets mensuels</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedBudget(null);
            setShowModal(true);
          }}
        >
          + Ajouter un Budget
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters">
          <div className="form-group">
            <label>Mois</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Année</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {budgets.length > 0 && (
        <div className="budget-overview">
          <div className="overview-card">
            <h3>Aperçu de {getMonthLabel()} {filters.year}</h3>
            <div className="overview-stats">
              <div className="stat">
                <span className="stat-label">Budget Total</span>
                <span className="stat-value">{formatCurrency(overview.totalBudget)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Dépensé</span>
                <span className="stat-value">{formatCurrency(overview.totalSpent)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Restant</span>
                <span className={`stat-value ${overview.remaining >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(overview.remaining)}
                </span>
              </div>
            </div>
            <div className="overview-progress">
              <div className="progress-info">
                <span>Progression Globale</span>
                <span className={overview.percentage > 100 ? 'text-danger' : ''}>
                  {overview.percentage}%
                </span>
              </div>
              <div className="progress-bar large">
                <div
                  className={`progress-fill ${overview.percentage > 100 ? 'exceeded' : overview.percentage > 80 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(overview.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : budgets.length > 0 ? (
        <div className="budgets-grid">
          {budgets.map(budget => {
            const percentage = budget.amount > 0
              ? Math.round((budget.spent / budget.amount) * 100)
              : 0;
            const remaining = budget.amount - (budget.spent || 0);

            return (
              <div key={budget.id} className={`budget-card ${percentage > 100 ? 'exceeded' : ''}`}>
                <div className="budget-header">
                  <h4>{budget.category_name}</h4>
                  <div className="budget-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(budget)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(budget)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="amount-item">
                    <span className="label">Budget</span>
                    <span className="value">{formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="label">Dépensé</span>
                    <span className="value spent">{formatCurrency(budget.spent || 0)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="label">Restant</span>
                    <span className={`value ${remaining >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${percentage > 100 ? 'exceeded' : percentage > 80 ? 'warning' : ''}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`percentage ${percentage > 100 ? 'exceeded' : ''}`}>
                    {percentage}% utilisé
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Aucun Budget Défini</h3>
            <p>Créez des budgets pour suivre vos dépenses par catégorie</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => {
                setSelectedBudget(null);
                setShowModal(true);
              }}
            >
              Créer Votre Premier Budget
            </button>
          </div>
        </div>
      )}

      {/* Budget Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBudget(null);
        }}
        title={selectedBudget ? 'Modifier le Budget' : 'Ajouter un Budget'}
      >
        <BudgetForm
          budget={selectedBudget}
          categories={categories}
          currentMonth={filters.month}
          currentYear={filters.year}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowModal(false);
            setSelectedBudget(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBudgetToDelete(null);
        }}
        title="Confirmer la Suppression"
      >
        <div className="confirm-delete">
          <p>Êtes-vous sûr de vouloir supprimer ce budget ?</p>
          {budgetToDelete && (
            <div className="budget-preview">
              <strong>{budgetToDelete.category_name}</strong>
              <span>{formatCurrency(budgetToDelete.amount)}</span>
            </div>
          )}
          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setBudgetToDelete(null);
              }}
              style={{ flex: 1 }}
            >
              Annuler
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmDelete}
              style={{ flex: 1 }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budget;
