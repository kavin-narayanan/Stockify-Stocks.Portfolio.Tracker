import axios from 'axios';

const API_URL = 'https://stockify-stocks-portfolio-tracker.onrender.com/stocks'; 

export const getAllStocks = async () => {
    return axios.get(`${API_URL}/all`);
};

export const addStock = async (stock) => {
    return axios.post(`${API_URL}/add`, stock);
};

export const deleteStock = async (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

export const updateStock = async (stock) => {
    return axios.put(`${API_URL}/${stock.id}`, stock);
};

export const getTopPerformingStock = async () => {
    return axios.get(`${API_URL}/top-performing`);
};

export const getPortfolioDistribution = async () => {
    return axios.get(`${API_URL}/distribution`);
};
