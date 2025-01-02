import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import {
  Dashboard,
  Menu,
  ViewPages,
  Login,
  PageLayout,
  ViewPdfs,
  ViewBanner,
  ViewFooterLinks,
  ViewSocialLinks,
} from './scenes';
import PostList from './scenes/posts';
import ViewGallery from './scenes/gallery';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';

const AppRouter = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          >
            {/* Admin routes */}
            <Route path="/menu" element={<Menu />} />
            <Route path="/layouts" element={<PageLayout />} />
            <Route path="/pages" element={<ViewPages />} />

            {/* Editor routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/gallery" element={<ViewGallery />} />
            <Route path="/pdfs" element={<ViewPdfs />} />
            <Route path="/banners" element={<ViewBanner />} />
            <Route path="/footer-links" element={<ViewFooterLinks />} />
            <Route path="/social-links" element={<ViewSocialLinks />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
