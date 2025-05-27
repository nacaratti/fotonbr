import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import EquipmentPage from '@/pages/EquipmentPage';
import ProjectsPage from '@/pages/ProjectsPage';
import NewsletterPage from '@/pages/NewsletterPage';
import ForumPage from '@/pages/ForumPage';
import ForumPostDetailsPage from '@/pages/ForumPostDetailsPage';
import CreateForumPostPage from '@/pages/CreateForumPostPage';
import AdminPage from '@/pages/AdminPage';
import UserProfilePage from '@/pages/UserProfilePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import Obrigado from '@/pages/Obrigado';

function App() {
  return (
    <Layout>
      <Routes>
        {/* 🌎 Rotas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/equipamentos" element={<EquipmentPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/post/:id" element={<ForumPostDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/obrigado" element={<Obrigado />} />

        {/* 🔒 Rotas protegidas (usuário autenticado) */}
        <Route
          path="/forum/novo-post"
          element={
            <ProtectedRoute>
              <CreateForumPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 🔥 Rotas protegidas (somente admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 🚧 Página não encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
