// App.jsx
// Root component: sets up all routes and providers

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobsProvider } from './context/JobsContext';

// Layout
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Public
import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';

// Pages - Seeker
import JobListings  from './pages/seeker/JobListings';
import JobDetail    from './pages/seeker/JobDetail';
import Applications from './pages/seeker/Applications';
import Profile      from './pages/seeker/Profile';

// Pages - Employer
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob           from './pages/employer/PostJob';
import EmployerJobs      from './pages/employer/EmployerJobs';
import Applicants        from './pages/employer/Applicants';

// Smart redirect: logged in users go to their dashboard
function AuthRedirect({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'employer' ? '/employer/dashboard' : '/seeker/jobs'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ——— Public ——— */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={
          <AuthRedirect><Login /></AuthRedirect>
        } />

        <Route path="/register" element={
          <AuthRedirect><Register /></AuthRedirect>
        } />

        {/* ——— Job Seeker ——— */}
        <Route path="/seeker/jobs" element={
          <ProtectedRoute role="seeker"><JobListings /></ProtectedRoute>
        } />

        <Route path="/seeker/jobs/:id" element={
          <ProtectedRoute role="seeker"><JobDetail /></ProtectedRoute>
        } />

        <Route path="/seeker/applications" element={
          <ProtectedRoute role="seeker"><Applications /></ProtectedRoute>
        } />

        <Route path="/seeker/profile" element={
          <ProtectedRoute role="seeker"><Profile /></ProtectedRoute>
        } />

        {/* ——— Employer ——— */}
        <Route path="/employer/dashboard" element={
          <ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>
        } />

        <Route path="/employer/post-job" element={
          <ProtectedRoute role="employer"><PostJob /></ProtectedRoute>
        } />

        <Route path="/employer/jobs" element={
          <ProtectedRoute role="employer"><EmployerJobs /></ProtectedRoute>
        } />

        <Route path="/employer/jobs/:jobId/applicants" element={
          <ProtectedRoute role="employer"><Applicants /></ProtectedRoute>
        } />

        {/* ——— Fallback ——— */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// 404 Page
function NotFound() {
  const { user } = useAuth();
  const home = user
    ? (user.role === 'employer' ? '/employer/dashboard' : '/seeker/jobs')
    : '/';

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="empty-state" style={{ paddingTop: '80px' }}>
          <div className="empty-state-icon" style={{ fontSize: '2.5rem' }}>🔍</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--blue-200)' }}>
            404
          </h2>
          <h3>Page not found</h3>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <a href={home} className="btn btn-primary">Go Home</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JobsProvider>
          <AppRoutes />
        </JobsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
