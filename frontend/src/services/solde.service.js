import api from './api';

export const getSolde = async () => {
  const response = await api.get('/solde');
  return response.data;
};

export const updateInitialBalance = async (initial_balance) => {
  const response = await api.put('/solde/initial', { initial_balance });
  return response.data;
};

export const recalculateBalance = async () => {
  const response = await api.post('/solde/recalculate');
  return response.data;
};
