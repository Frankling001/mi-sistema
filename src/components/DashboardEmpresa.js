// src/components/DashboardEmpresa.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardEmpresa = ({ 
  currentUser, 
  setView, 
  handleLogout, 
  API_BASE_URL, 
  loading, 
  setLoading 
}) => {
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [empleos, setEmpleos] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [newJob, setNewJob] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    salario: '',
    modalidad: 'presencial',
    ubicacion: 'Huánuco'
  });

  useEffect(() => {
    cargarEmpleosEmpresa();
    cargarPostulacionesEmpresa();
  }, [currentUser]);

  const cargarEmpleosEmpresa = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/empleos.php?action=empresa&empresa_id=${currentUser.id}`
      );
      if (response.data.success) {
        setEmpleos(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar empleos:', err);
    }
  };

  const cargarPostulacionesEmpresa = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/postulaciones.php?action=empresa&empresa_id=${currentUser.id}`
      );
      if (response.data.success) {
        setPostulaciones(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar postulaciones:', err);
    }
  };

  const handleJobChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/empleos.php?action=create`,
        {
          empresa_id: currentUser.id,
          ...newJob
        }
      );
      
      if (response.data.success) {
        alert('¡Empleo creado exitosamente!');
        setShowNewJobForm(false);
        setNewJob({
          titulo: '',
          descripcion: '',
          requisitos: '',
          salario: '',
          modalidad: 'presencial',
          ubicacion: 'Huánuco'
        });
        await cargarEmpleosEmpresa();
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear empleo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="gradient-bg-green text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">🏢 Panel de Empresa</h1>
          <div className="flex items-center gap-6">
            <span className="text-lg">Hola, <strong>{currentUser?.nombre}</strong></span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-6 py-3 rounded-xl hover:bg-red-600 font-semibold shadow-lg transition-all hover:scale-105"
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glassmorphism p-8 rounded-2xl shadow-lg card-hover">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">💼 Empleos Publicados</h3>
            <p className="text-4xl font-bold text-green-600">{empleos.length}</p>
          </div>

          <div className="glassmorphism p-8 rounded-2xl shadow-lg card-hover">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📥 Postulaciones Recibidas</h3>
            <p className="text-4xl font-bold text-blue-600">{postulaciones.length}</p>
          </div>

          <div className="glassmorphism p-8 rounded-2xl shadow-lg card-hover">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🏭 Sector</h3>
            <p className="text-2xl font-semibold text-gray-800 capitalize">
              {currentUser?.sector || 'N/A'}
            </p>
          </div>
        </div>

        {/* Mis Ofertas Laborales */}
        <div className="glassmorphism rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-green-900">💼 Mis Ofertas Laborales</h2>
            <button
              onClick={() => setShowNewJobForm(!showNewJobForm)}
              className="btn-success text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">➕</span> Nueva Oferta
            </button>
          </div>

          {/* Formulario Nueva Oferta */}
          {showNewJobForm && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl mb-8 border-2 border-green-200 fade-in">
              <h3 className="font-bold text-green-900 mb-6 text-2xl">
                ✨ Crear Nueva Oferta Laboral
              </h3>
              
              <form onSubmit={handleCreateJob} className="space-y-5">
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título del puesto"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={newJob.titulo}
                  onChange={handleJobChange}
                  required
                />

                <textarea
                  name="descripcion"
                  placeholder="Descripción del puesto"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl h-32 focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={newJob.descripcion}
                  onChange={handleJobChange}
                  required
                />

                <textarea
                  name="requisitos"
                  placeholder="Requisitos (separados por comas)"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl h-32 focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={newJob.requisitos}
                  onChange={handleJobChange}
                />

                <input
                  type="text"
                  name="salario"
                  placeholder="Salario (S/)"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={newJob.salario}
                  onChange={handleJobChange}
                />

                <select
                  name="modalidad"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={newJob.modalidad}
                  onChange={handleJobChange}
                >
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                </select>

                <input
                  type="text"
                  name="ubicacion"
                  placeholder="Ubicación"
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 transition-all"
                  value={newJob.ubicacion}
                  onChange={handleJobChange}
                />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-success text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Publicando...' : '✓ Publicar Oferta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewJobForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-400 transition-all"
                  >
                    ✗ Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Empleos */}
          <div className="space-y-5">
            {empleos.length > 0 ? (
              empleos.map(empleo => (
                <div 
                  key={empleo.id} 
                  className="border-2 border-gray-200 p-6 rounded-2xl bg-white hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {empleo.titulo}
                      </h3>
                      <p className="text-gray-600">📅 Publicado: {empleo.fecha}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                      {empleo.num_postulaciones || 0} postulaciones
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {empleo.descripcion}
                  </p>
                  
                  <div className="flex gap-3">
                    <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-semibold">
                      💰 S/ {empleo.salario}
                    </span>
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold">
                      📍 {empleo.modalidad}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-12 text-lg">
                📭 No has publicado ofertas laborales aún. ¡Crea tu primera oferta!
              </p>
            )}
          </div>
        </div>

        {/* Postulaciones Recibidas */}
        <div className="glassmorphism rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-green-900 mb-6">
            📥 Postulaciones Recibidas
          </h2>
          
          {postulaciones.length > 0 ? (
            <div className="space-y-4">
              {postulaciones.map(post => (
                <div 
                  key={post.id} 
                  className="border-2 border-gray-200 p-6 rounded-xl bg-white hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-xl mb-1">
                        👤 {post.usuario_nombre}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        💼 Posición: {post.empleo_titulo}
                      </p>
                      <p className="text-gray-600 mb-2">
                        📧 {post.usuario_email}
                      </p>
                      <p className="text-gray-600 mb-2">
                        📞 {post.usuario_telefono}
                      </p>
                      {post.profesion && (
                        <p className="text-gray-600 mb-2">
                          🎓 {post.profesion}
                        </p>
                      )}
                      {post.fortalezas && (
                        <p className="text-gray-600 mb-2">
                          ⭐ Fortalezas: {post.fortalezas}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        📅 Fecha: {post.fecha}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      {post.matching_score > 0 && (
                        <div className="match-badge text-white px-4 py-2 rounded-lg font-bold mb-2">
                          {post.matching_score}% Match
                        </div>
                      )}
                      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold block text-center">
                        {post.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button className="btn-success text-white px-5 py-2 rounded-lg font-semibold shadow flex-1">
                      👁️ Ver CV Completo
                    </button>
                    <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow flex-1">
                      📞 Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12 text-lg">
              📭 No has recibido postulaciones aún. Publica ofertas laborales para recibir candidatos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardEmpresa;