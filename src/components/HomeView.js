// src/components/HomeView.js
import React from 'react';

const HomeView = ({ setView, setUserType }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 fade-in">
          <h1 className="text-6xl font-black text-transparent bg-clip-text mb-6" 
              style={{backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            Sistema de Inserción Laboral Inclusiva
          </h1>
          <p className="text-2xl text-purple-700 mb-3 font-semibold">🇵🇪 Huánuco - Perú</p>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Tecnología e Inteligencia Artificial al servicio de la inclusión laboral sostenible
          </p>
        </div>

        <div className="glassmorphism rounded-2xl shadow-2xl p-10 mb-12 fade-in">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6 text-center">
            🎯 Objetivos del Proyecto
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border-2 border-blue-200 card-hover">
              <h3 className="font-bold text-indigo-900 mb-3 text-xl flex items-center">
                <span className="text-3xl mr-3">✓</span>
                Objetivo General
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Optimizar la inserción laboral sostenible de personas con discapacidad física, 
                sensorial y psicosocial en Huánuco mediante un sistema web con agentes de IA que 
                incorpore accesibilidad digital, automatización y acompañamiento integral.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border-2 border-green-200 card-hover">
              <h3 className="font-bold text-green-900 mb-3 text-xl flex items-center">
                <span className="text-3xl mr-3">📈</span>
                Objetivos Específicos
              </h3>
              <ul className="text-gray-700 space-y-2 leading-relaxed">
                <li>✦ Implementar creación automática de CV por voz con IA</li>
                <li>✦ Diseñar matching inteligente con empresas inclusivas</li>
                <li>✦ Automatizar postulaciones laborales</li>
                <li>✦ Integrar acompañamiento psicosocial continuo</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div className="glassmorphism rounded-2xl shadow-2xl p-10 card-hover fade-in">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl shadow-lg">
                👤
              </div>
              <h2 className="text-3xl font-bold text-indigo-900 mb-4">
                Persona con Discapacidad
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Crea tu CV por voz, encuentra empleos ideales con IA y recibe acompañamiento 
                psicosocial personalizado
              </p>
              <button 
                onClick={() => { 
                  setUserType('candidato'); 
                  setView('register'); 
                }}
                className="btn-primary text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg w-full mb-4">
                Registrarse como Candidato
              </button>
              <button 
                onClick={() => { 
                  setUserType('candidato'); 
                  setView('login'); 
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold">
                ¿Ya tienes cuenta? Inicia sesión →
              </button>
            </div>
          </div>

          <div className="glassmorphism rounded-2xl shadow-2xl p-10 card-hover fade-in">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-5xl shadow-lg">
                🏢
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-4">
                Empresa Inclusiva
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Publica vacantes, encuentra talento diverso y construye equipos inclusivos 
                y sostenibles
              </p>
              <button 
                onClick={() => { 
                  setUserType('empresa'); 
                  setView('register'); 
                }}
                className="btn-success text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg w-full mb-4">
                Registrarse como Empresa
              </button>
              <button 
                onClick={() => { 
                  setUserType('empresa'); 
                  setView('login'); 
                }}
                className="text-green-600 hover:text-green-800 font-semibold">
                ¿Ya tienes cuenta? Inicia sesión →
              </button>
            </div>
          </div>
        </div>

        <div className="glassmorphism rounded-2xl shadow-2xl p-10 fade-in">
          <h2 className="text-3xl font-bold text-indigo-900 mb-10 text-center">
            🚀 Características Innovadoras con IA
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl card-hover">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">CV por Voz con IA</h3>
              <p className="text-sm text-gray-600">
                Agente inteligente que genera currículos profesionales mediante comandos de voz
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl card-hover">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Matching Inteligente</h3>
              <p className="text-sm text-gray-600">
                Algoritmo de IA que conecta candidatos con empleos según fortalezas y perfil
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl card-hover">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Postulación Automática</h3>
              <p className="text-sm text-gray-600">
                Automatización completa del proceso de postulación en un solo clic
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl card-hover">
              <div className="text-6xl mb-4">💖</div>
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Acompañamiento Psicosocial</h3>
              <p className="text-sm text-gray-600">
                Mensajes motivacionales y seguimiento continuo con IA emocional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;