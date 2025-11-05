// src/components/LoginView.js
import React, { useState } from 'react';
import axios from 'axios';

const LoginView = ({ 
  userType, 
  setView, 
  setCurrentUser, 
  API_BASE_URL, 
  loading, 
  setLoading, 
  error, 
  setError 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = userType === 'candidato'
        ? `${API_BASE_URL}/usuarios.php?action=login`
        : `${API_BASE_URL}/empresas.php?action=login`;
      
      const response = await axios.post(endpoint, formData);
      
      if (response.data.success) {
        setCurrentUser(response.data.data);
        alert('¡Bienvenido de nuevo!');
        setView(userType === 'candidato' ? 'dashboardCandidato' : 'dashboardEmpresa');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-md mx-auto glassmorphism rounded-2xl shadow-2xl p-10 fade-in">
        <h2 className="text-4xl font-bold text-indigo-900 mb-8 text-center">
          🔐 Iniciar Sesión
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          {userType === 'candidato' ? 'Candidato' : 'Empresa'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg ${
              userType === 'candidato' ? 'btn-primary' : 'btn-success'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <button
            type="button"
            onClick={() => setView('home')}
            className="w-full py-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
          >
            ← Volver
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => setView('register')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;