import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import FormularioCliente from './FormularioCliente';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

// Ruta protegida — solo accesible si hay sesión activa
const ProtectedRoute = ({ session, children }) => {
  if (!session) return <Navigate to="/admin/login" replace />;
  return children;
};

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = cargando

  useEffect(() => {
    // Obtiene sesión actual al cargar
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Escucha cambios de sesión (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        setSession(session);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Evita flash de contenido mientras carga la sesión
  if (session === undefined)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* Vista pública del cliente */}
        <Route path="/reserva" element={<FormularioCliente />} />

        {/* Login del admin */}
        <Route
          path="/admin/login"
          element={session ? <Navigate to="/admin" replace /> : <AdminLogin />}
        />

        {/* Dashboard protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute session={session}>
              <AdminDashboard session={session} />
            </ProtectedRoute>
          }
        />

        {/* Redirige la raíz a /reserva */}
        <Route path="*" element={<Navigate to="/reserva" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
