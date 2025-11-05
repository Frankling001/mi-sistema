// src/components/RegisterView.js
import React, { useState } from 'react';
import axios from 'axios';

const RegisterView = ({ 
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
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    ruc: '',
    sector: '',
    tipoDiscapacidad: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = userType === 'candidato' 
        ? `${API_BASE_URL}/usuarios.php?action=register`
        : `${API_BASE_URL}/empresas.php?action=register`;
      
      const response = await axios.post(endpoint, formData);
      
      if (response.data.success) {
        setCurrentUser(response.data.data);
        alert(response.data.message);
        setView(userType === 'candidato' ? 'createCV' : 'dashboardEmpresa');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto glassmorphism rounded-2xl shadow-2xl p-10 fade-in">
        <h2 className="text-4xl font-bold text-indigo-900 mb-8 text-center">
          {userType === 'candidato' ? '👤 Registro de Candidato' : '🏢 Registro de Empresa'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            name="nombre"
            placeholder={userType === 'candidato' ? 'Nombre completo' : 'Razón Social'}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

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
            placeholder="Contraseña (mínimo 6 caracteres)"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
            value={formData.telefono}
            onChange={handleChange}
          />
          
          {userType === 'empresa' ? (
            <>
              <input
                type="text"
                name="ruc"
                placeholder="RUC (11 dígitos)"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                value={formData.ruc}
                onChange={handleChange}
                required
                maxLength={11}
                pattern="[0-9]{11}"
              />
              <select
                name="sector"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                value={formData.sector}
                onChange={handleChange}
              >
                <option value="">Selecciona el sector</option>
                <option value="tecnologia">Tecnología</option>
                <option value="educacion">Educación</option>
                <option value="salud">Salud</option>
                <option value="comercio">Comercio</option>
                <option value="servicios">Servicios</option>
                <option value="industria">Industria</option>
                <option value="agricultura">Agricultura</option>
              </select>
            </>
          ) : (
            <select
              name="tipoDiscapacidad"
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
              value={formData.tipoDiscapacidad}
              onChange={handleChange}
            >
              <option value="">Tipo de discapacidad</option>
              <option value="fisica">Física</option>
              <option value="sensorial-visual">Sensorial - Visual</option>
              <option value="sensorial-auditiva">Sensorial - Auditiva</option>
              <option value="psicosocial">Psicosocial</option>
              <option value="intelectual">Intelectual</option>
              <option value="multiple">Múltiple</option>
            </select>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg ${
              userType === 'candidato' ? 'btn-primary' : 'btn-success'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Registrando...' : 'Registrarse Ahora'}
          </button>

          <button
            type="button"
            onClick={() => setView('home')}
            className="w-full py-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
          >
            ← Volver al Inicio
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterView;