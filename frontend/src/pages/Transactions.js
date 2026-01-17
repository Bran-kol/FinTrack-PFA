import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTransactions, deleteTransaction } from '../services/transaction.service';
import { getCategories } from '../services/category.service';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    month: '',
    year: new Date().getFullYear().toString()
  });

  const months = [
    { value: '', label: 'Tous les Mois' },
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
      const [transactionsRes, categoriesRes] = await Promise.all([
        getTransactions(filters),
        getCategories()
      ]);
      setTransactions(transactionsRes.transactions || []);
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

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(transactionToDelete.id);
      toast.success('Transaction supprimée');
      fetchData();
    } catch (error) {
      toast.error('Échec de la suppression');
    } finally {
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedTransaction(null);
    fetchData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate summary
  const summary = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.income += parseFloat(t.amount);
      } else {
        acc.expense += parseFloat(t.amount);
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Transactions</h1>
          <p className="text-muted">Gérez vos revenus et dépenses</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedTransaction(null);
            setShowModal(true);
          }}
        >
          + Ajouter une Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters">
          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Tous les Types</option>
              <option value="income">Revenu</option>
              <option value="expense">Dépense</option>
            </select>
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les Catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

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

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card income">
          <span className="stat-label">Total Revenus</span>
          <span className="stat-value">{formatCurrency(summary.income)}</span>
        </div>
        <div className="stat-card expense">
          <span className="stat-label">Total Dépenses</span>
          <span className="stat-value">{formatCurrency(summary.expense)}</span>
        </div>
        <div className="stat-card balance">
          <span className="stat-label">Solde Net</span>
          <span className={`stat-value ${summary.income - summary.expense >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary.income - summary.expense)}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th className="text-right">Montant</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>
                      <span className={`badge ${transaction.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                      </span>
                    </td>
                    <td>{transaction.category_name}</td>
                    <td>{transaction.description || '-'}</td>
                    <td className={`text-right font-medium ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(transaction)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(transaction)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucune Transaction Trouvée</h3>
            <p>Aucune transaction ne correspond aux filtres sélectionnés</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => {
                setSelectedTransaction(null);
                setShowModal(true);
              }}
            >
              Ajouter Votre Première Transaction
            </button>
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTransaction(null);
        }}
        title={selectedTransaction ? 'Modifier la Transaction' : 'Ajouter une Transaction'}
      >
        <TransactionForm
          transaction={selectedTransaction}
          categories={categories}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowModal(false);
            setSelectedTransaction(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTransactionToDelete(null);
        }}
        title="Confirmer la Suppression"
      >
        <div className="confirm-delete">
          <p>Êtes-vous sûr de vouloir supprimer cette transaction ?</p>
          {transactionToDelete && (
            <div className="transaction-preview">
              <span className={`badge ${transactionToDelete.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                {transactionToDelete.type === 'income' ? 'Revenu' : 'Dépense'}
              </span>
              <strong>{formatCurrency(transactionToDelete.amount)}</strong>
              <span>{transactionToDelete.description || transactionToDelete.category_name}</span>
            </div>
          )}
          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowDeleteConfirm(false);
                setTransactionToDelete(null);
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

export default Transactions;
