// src/App.js - Frontend React Completo
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Componentes
import HomeView from "./components/HomeView";
import RegisterView from "./components/RegisterView";
import LoginView from "./components/LoginView";
import CreateCVView from "./components/CreateCVView";
import DashboardCandidato from "./components/DashboardCandidato";
import DashboardEmpresa from "./components/DashboardEmpresa";

// Configuración de la API
const API_BASE_URL = "http://localhost/mi-plataforma/mi-sistema/api";

function App() {
  const [view, setView] = useState("home");
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setUserType(user.tipo);
      setView(
        user.tipo === "candidato" ? "dashboardCandidato" : "dashboardEmpresa"
      );
    }
  }, []);

  // Guardar usuario en localStorage cuando cambie
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // Función para logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setView("home");
    localStorage.removeItem("currentUser");
  };

  return (
    <div className="App">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      )}

      {view === "home" && (
        <HomeView setView={setView} setUserType={setUserType} />
      )}

      {view === "register" && (
        <RegisterView
          userType={userType}
          setView={setView}
          setCurrentUser={setCurrentUser}
          API_BASE_URL={API_BASE_URL}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      )}

      {view === "login" && (
        <LoginView
          userType={userType}
          setView={setView}
          setCurrentUser={setCurrentUser}
          API_BASE_URL={API_BASE_URL}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      )}

      {view === "createCV" && (
        <CreateCVView
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setView={setView}
          API_BASE_URL={API_BASE_URL}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
        />
      )}

      {view === "dashboardCandidato" && (
        <DashboardCandidato
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setView={setView}
          handleLogout={handleLogout}
          API_BASE_URL={API_BASE_URL}
          loading={loading}
          setLoading={setLoading}
        />
      )}

      {view === "dashboardEmpresa" && (
        <DashboardEmpresa
          currentUser={currentUser}
          setView={setView}
          handleLogout={handleLogout}
          API_BASE_URL={API_BASE_URL}
          loading={loading}
          setLoading={setLoading}
        />
      )}
    </div>
  );
}

export default App;
