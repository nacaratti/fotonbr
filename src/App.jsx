import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage.jsx';
import EquipmentPage from '@/pages/EquipmentPage.jsx';
import ProjectsPage from '@/pages/ProjectsPage.jsx';
import NewsletterPage from '@/pages/NewsletterPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import ForumPage from '@/pages/ForumPage.jsx'; 
import ForumPostDetailsPage from '@/pages/ForumPostDetailsPage.jsx';
import CreateForumPostPage from '@/pages/CreateForumPostPage.jsx';
import AdminPage from '@/pages/AdminPage.jsx';
import UserProfilePage from '@/pages/UserProfilePage.jsx'; // Import UserProfilePage
import { useAuth } from '@/contexts/AuthContext.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg text-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    // User not logged in, redirect to login
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (adminOnly) {
    // This route requires admin privileges
    if (!profile) {
      // Profile is still loading or not found, can show a loading or redirect,
      // but AuthContext loading should ideally cover this.
      // If profile is definitively null after loading, user is not an admin.
      console.warn("Admin route: Profile not available for user:", user.id);
      return <Navigate to="/" replace />; 
    }
    if (profile.role !== 'admin') {
      // User is logged in but not an admin, redirect to home
      console.warn("Admin route: User does not have admin role. Role:", profile.role);
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
}


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/equipamentos" element={<EquipmentPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/post/:id" element={<ForumPostDetailsPage />} />
        <Route 
          path="/forum/novo-post" 
          element={
            <ProtectedRoute>
              <CreateForumPostPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
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
        {/* Add a catch-all or 404 page if desired */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Layout>
  );
}

export default App;