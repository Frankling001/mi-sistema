// src/components/CreateCVView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateCVView = ({ 
  currentUser, 
  setCurrentUser, 
  setView, 
  API_BASE_URL, 
  loading, 
  setLoading, 
  error, 
  setError 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [cvData, setCvData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoDiscapacidad: '',
    profesion: '',
    experiencia: '',
    fortalezas: '',
    habilidades: '',
    educacion: ''
  });

  // Cargar CV existente si hay
  useEffect(() => {
    if (currentUser?.cvData) {
      setCvData(currentUser.cvData);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setCvData({
      ...cvData,
      [e.target.name]: e.target.value
    });
  };

  // Simulación de reconocimiento de voz
  const startVoiceRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      const simulatedVoice = "Mi nombre es Juan Pérez, tengo 28 años. Soy técnico en computación y tengo experiencia en soporte técnico. Mis fortalezas son la resolución de problemas, comunicación efectiva y trabajo en equipo. Tengo discapacidad física en movilidad reducida.";
      setVoiceText(simulatedVoice);
      processVoiceToCV(simulatedVoice);
      setIsRecording(false);
    }, 3000);
  };

  const processVoiceToCV = (text) => {
    const tempData = { ...cvData };
    
    if (text.toLowerCase().includes('nombre')) {
      const nombreMatch = text.match(/nombre es ([A-Za-záéíóúñ\s]+)/i);
      if (nombreMatch) tempData.nombre = nombreMatch[1].trim();
    }
    if (text.toLowerCase().includes('técnico') || text.toLowerCase().includes('profesión')) {
      tempData.profesion = 'Técnico en Computación';
    }
    if (text.toLowerCase().includes('fortaleza')) {
      tempData.fortalezas = 'Resolución de problemas, comunicación efectiva, trabajo en equipo';
    }
    if (text.toLowerCase().includes('experiencia')) {
      tempData.experiencia = 'Soporte técnico';
    }
    if (text.toLowerCase().includes('discapacidad')) {
      tempData.tipoDiscapacidad = 'Física - Movilidad reducida';
    }
    
    setCvData(tempData);
  };

  const handleSaveCV = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/curriculum.php?action=create`, {
        usuario_id: currentUser.id,
        ...cvData,
        textoVoz: voiceText
      });
      
      if (response.data.success) {
        setCurrentUser({ 
          ...currentUser, 
          cvData: response.data.data 
        });
        alert('¡CV guardado exitosamente!');
        setView('dashboardCandidato');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto glassmorphism rounded-2xl shadow-2xl p-10 fade-in">
        <h2 className="text-4xl font-bold text-indigo-900 mb-8 text-center">
          🎤 Creación de CV con Inteligencia Artificial por Voz
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-8 rounded-2xl mb-8 border-2 border-purple-200">
          <h3 className="font-bold text-purple-900 mb-4 text-xl">💡 ¿Cómo funciona?</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Nuestro agente de IA te guiará para crear tu currículum profesional usando solo tu voz. 
            Presiona el botón del micrófono y cuéntanos sobre ti: tu nombre, profesión, experiencia, 
            fortalezas y habilidades.
          </p>
          
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={isRecording ? () => setIsRecording(false) : startVoiceRecording}
              className={`p-12 rounded-full text-white shadow-2xl transition-all ${
                isRecording ? 'bg-red-500 recording-pulse' : 'btn-primary hover:scale-110'
              }`}
            >
              <span className="text-6xl">{isRecording ? '🛑' : '🎤'}</span>
            </button>
          </div>
          
          {isRecording && (
            <p className="text-center text-red-600 font-bold text-xl animate-pulse">
              🎙️ Escuchando... Habla ahora
            </p>
          )}
          
          {voiceText && (
            <div className="mt-6 p-6 bg-white rounded-xl border-2 border-purple-300 shadow-lg">
              <p className="text-sm text-purple-600 mb-3 font-semibold">✓ Texto reconocido por IA:</p>
              <p className="text-gray-800 leading-relaxed">{voiceText}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveCV} className="space-y-5">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.nombre}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.telefono}
            onChange={handleChange}
          />

          <input
            type="text"
            name="tipoDiscapacidad"
            placeholder="Tipo de discapacidad"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.tipoDiscapacidad}
            onChange={handleChange}
          />

          <input
            type="text"
            name="profesion"
            placeholder="Profesión"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.profesion}
            onChange={handleChange}
            required
          />

          <textarea
            name="experiencia"
            placeholder="Experiencia laboral"
            className="w-full p-4 border-2 border-gray-300 rounded-xl h-32 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.experiencia}
            onChange={handleChange}
          />

          <textarea
            name="fortalezas"
            placeholder="Fortalezas (separadas por comas)"
            className="w-full p-4 border-2 border-gray-300 rounded-xl h-32 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.fortalezas}
            onChange={handleChange}
            required
          />

          <textarea
            name="habilidades"
            placeholder="Habilidades técnicas (separadas por comas)"
            className="w-full p-4 border-2 border-gray-300 rounded-xl h-32 focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.habilidades}
            onChange={handleChange}
          />

          <input
            type="text"
            name="educacion"
            placeholder="Educación"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all"
            value={cvData.educacion}
            onChange={handleChange}
          />

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 btn-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Guardando...' : '💾 Guardar CV y Continuar'}
            </button>
            
            {currentUser?.cvData && (
              <button
                type="button"
                onClick={() => setView('dashboardCandidato')}
                className="px-8 py-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCVView;