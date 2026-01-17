import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from '../services/transaction.service';
import './TransactionForm.css';

const TransactionForm = ({ transaction, categories, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category_id: transaction.category_id,
        amount: transaction.amount,
        description: transaction.description || '',
        date: transaction.date.split('T')[0]
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category_id) {
      newErrors.category_id = 'La catégorie est requise';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }
    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (transaction) {
        await updateTransaction(transaction.id, formData);
        toast.success('Transaction mise à jour');
      } else {
        await createTransaction(formData);
        toast.success('Transaction créée');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-group">
        <label>Type</label>
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn expense ${formData.type === 'expense' ? 'active' : ''}`}
            onClick={() => {
              setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }));
            }}
          >
            📉 Dépense
          </button>
          <button
            type="button"
            className={`toggle-btn income ${formData.type === 'income' ? 'active' : ''}`}
            onClick={() => {
              setFormData(prev => ({ ...prev, type: 'income', category_id: '' }));
            }}
          >
            📈 Revenu
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category_id">Catégorie *</label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className={errors.category_id ? 'error' : ''}
        >
          <option value="">Sélectionner une catégorie</option>
          {filteredCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category_id && <span className="error-text">{errors.category_id}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="amount">Montant *</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          className={errors.amount ? 'error' : ''}
        />
        {errors.amount && <span className="error-text">{errors.amount}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? 'error' : ''}
        />
        {errors.date && <span className="error-text">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ajouter des détails sur cette transaction..."
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enregistrement...' : (transaction ? 'Mettre à Jour' : 'Ajouter la Transaction')}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
