import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createBudget, updateBudget } from '../services/budget.service';

const BudgetForm = ({ budget, categories, currentMonth, currentYear, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    month: currentMonth,
    year: currentYear
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Only expense categories can have budgets
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount,
        month: budget.month.toString(),
        year: budget.year.toString()
      });
    } else {
      setFormData(prev => ({
        ...prev,
        month: currentMonth,
        year: currentYear
      }));
    }
  }, [budget, currentMonth, currentYear]);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount)
      };

      if (budget) {
        await updateBudget(budget.id, payload);
        toast.success('Budget mis à jour');
      } else {
        await createBudget(payload);
        toast.success('Budget créé');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

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
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y <= thisYear + 2; y++) {
    years.push(y.toString());
  }

  return (
    <form onSubmit={handleSubmit} className="budget-form">
      <div className="form-group">
        <label htmlFor="category_id">Catégorie *</label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className={errors.category_id ? 'error' : ''}
          disabled={!!budget}
        >
          <option value="">Sélectionner une catégorie</option>
          {expenseCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.category_id && <span className="error-text">{errors.category_id}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="amount">Montant du Budget *</label>
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

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="month">Mois</label>
          <select
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            disabled={!!budget}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="year">Année</label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            disabled={!!budget}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enregistrement...' : (budget ? 'Mettre à Jour' : 'Créer le Budget')}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
