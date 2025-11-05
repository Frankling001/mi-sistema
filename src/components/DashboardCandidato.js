// src/components/DashboardCandidato.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardCandidato = ({ 
  currentUser, 
  setCurrentUser,
  setView, 
  handleLogout, 
  API_BASE_URL, 
  loading, 
  setLoading 
}) => {
  const [empleosRecomendados, setEmpleosRecomendados] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [mensajesPsicosociales, setMensajesPsicosociales] = useState([]);

  useEffect(() => {
    if (currentUser?.cvData) {
      cargarEmpleosRecomendados();
    }
    cargarPostulaciones();
    cargarMensajesPsicosociales();
  }, [currentUser]);

  const cargarEmpleosRecomendados = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/matching.php?action=empleos&usuario_id=${currentUser.id}`
      );
      if (response.data.success) {
        setEmpleosRecomendados(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar empleos:', err);
      setEmpleosRecomendados([]);
    }
  };

  const cargarPostulaciones = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/postulaciones.php?action=usuario&usuario_id=${currentUser.id}`
      );
      if (response.data.success) {
        setPostulaciones(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar postulaciones:', err);
    }
  };

  const cargarMensajesPsicosociales = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/matching.php?action=mensajes&usuario_id=${currentUser.id}`
      );
      if (response.data.success) {
        setMensajesPsicosociales(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  };

  const postularAuto = async (empleoId) => {
    if (!currentUser?.cvData) {
      alert('Debes completar tu CV antes de postular');
      setView('createCV');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/postulaciones.php?action=create`,
        {
          usuario_id: currentUser.id,
          empleo_id: empleoId
        }
      );
      
      if (response.data.success) {
        alert('¡Postulación enviada exitosamente!');
        await cargarPostulaciones();
        await cargarMensajesPsicosociales();
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al postular');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="gradient-bg text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">👤 Panel de Candidato</h1>
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
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📄 Mi CV</h3>
            <p className="text-4xl font-bold text-indigo-600 mb-4">
              {currentUser?.cvData ? '✓ Completo' : '⚠ Pendiente'}
            </p>
            <button
              onClick={() => setView('createCV')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              {currentUser?.cvData ? '✏️ Editar CV' : '➕ Crear CV'}
            </button>
          </div>

          <div className="glassmorphism p-8 rounded-2xl shadow-lg card-hover">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🎯 Empleos Recomendados</h3>
            <p className="text-4xl font-bold text-green-600">{empleosRecomendados.length}</p>
          </div>

          <div className="glassmorphism p-8 rounded-2xl shadow-lg card-hover">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">📤 Mis Postulaciones</h3>
            <p className="text-4xl font-bold text-blue-600">{postulaciones.length}</p>
          </div>
        </div>

        {/* Mensajes Psicosociales */}
        {mensajesPsicosociales.length > 0 && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-l-4 border-pink-500 p-8 rounded-2xl mb-8 shadow-lg fade-in">
            <h3 className="font-bold text-pink-900 mb-5 flex items-center text-2xl">
              <span className="mr-3 text-3xl">💖</span> Acompañamiento Psicosocial
            </h3>
            {mensajesPsicosociales.slice(0, 3).map(msg => (
              <div key={msg.id} className="glassmorphism p-6 rounded-xl mb-3 shadow">
                <p className="text-gray-700 leading-relaxed">{msg.texto}</p>
                <p className="text-xs text-gray-500 mt-3">🕒 {msg.fecha}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empleos Recomendados */}
        <div className="glassmorphism rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6 flex items-center">
            <span className="mr-3 text-4xl">🔍</span> 
            Empleos Recomendados por IA (Matching Inteligente)
          </h2>
          
          <div className="space-y-5">
            {empleosRecomendados.length > 0 ? (
              empleosRecomendados.map(empleo => (
                <div 
                  key={empleo.id} 
                  className="border-2 border-gray-200 p-6 rounded-2xl hover:shadow-xl transition-all hover:border-indigo-300 bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {empleo.titulo}
                      </h3>
                      <p className="text-gray-600 text-lg">🏢 {empleo.empresa}</p>
                    </div>
                    <div className="match-badge text-white px-5 py-2 rounded-full text-lg font-bold shadow-lg">
                      {empleo.matchScore}% Match
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {empleo.descripcion}
                  </p>
                  
                  <div className="flex gap-3 mb-5">
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold">
                      📍 {empleo.modalidad}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-semibold">
                      💰 S/ {empleo.salario}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => postularAuto(empleo.id)}
                    disabled={loading}
                    className="btn-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="text-xl">✓</span> Postular Automáticamente
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6 text-lg">
                  {currentUser?.cvData 
                    ? '😊 No hay empleos disponibles en este momento. Volveremos a buscarte oportunidades pronto.'
                    : '📝 Completa tu CV para ver recomendaciones personalizadas de empleos.'
                  }
                </p>
                {!currentUser?.cvData && (
                  <button
                    onClick={() => setView('createCV')}
                    className="btn-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                  >
                    ➕ Crear mi CV ahora
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mis Postulaciones */}
        <div className="glassmorphism rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6">📋 Mis Postulaciones</h2>
          
          {postulaciones.length > 0 ? (
            <div className="space-y-4">
              {postulaciones.map(post => (
                <div 
                  key={post.id} 
                  className="border-2 border-gray-200 p-6 rounded-xl bg-white hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl mb-1">
                        {post.empleo_titulo}
                      </h3>
                      <p className="text-gray-600 mb-2">🏢 {post.empresa_nombre}</p>
                      <p className="text-gray-500 text-sm">📅 Postulado: {post.fecha}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                      {post.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12 text-lg">
              📭 Aún no has realizado postulaciones. Explora los empleos recomendados arriba.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCandidato;