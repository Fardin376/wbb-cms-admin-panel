// Router.jsx (AppRouter)
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import {
  Dashboard,
  FAQ,
  Menu,
  ViewPages,
  Login,
  PageLayout,
  ViewPdfs,
  ViewBanner,
  ViewFooterLinks,
} from './scenes';
import PostList from './scenes/posts';
import ViewGallery from './scenes/gallery';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Unauthorized from './components/Unauthorized';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<App />}>
            {/* Admin only routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']} />
              }
            >
              <Route path="/menu" element={<Menu />} />
              <Route path="/layouts" element={<PageLayout />} />
              <Route path="/pages" element={<ViewPages />} />
            </Route>

            {/* Editor and Admin routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'editor', 'superadmin']}
                />
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/posts" element={<PostList />} />
              <Route path="/gallery" element={<ViewGallery />} />
              <Route path="/pdfs" element={<ViewPdfs />} />
              <Route path="/banners" element={<ViewBanner />} />
              <Route path="/footer-links" element={<ViewFooterLinks />} />
            </Route>

            {/* Routes accessible to all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/faq" element={<FAQ />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
