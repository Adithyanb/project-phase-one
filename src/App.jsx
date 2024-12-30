import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'; // Add Link here
import UserButtons from './components/UserButtons';
import TeacherSignup from './components/auth/TeacherSignup';
import StudentSignup from './components/auth/StudentSignup';
import Login from './components/auth/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import './styles/App.css';
import './styles/Auth.css';
import { auth } from './services/firebase';
const App = () => {
  const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      const isTeacherRoute = window.location.pathname.includes('/teacher');
      return <Navigate to={isTeacherRoute ? '/teacher/login' : '/student/login'} />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <div id="app">
        <header>
          <Link to="/" className="header-title">
            <h1>DataHive</h1>
          </Link>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<UserButtons />} />
            <Route path="/teacher/signup" element={<TeacherSignup />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route
              path="/teacher/login"
              element={<Login userType="Teacher" />}
            />
            <Route
              path="/student/login"
              element={<Login userType="Student" />}
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <footer>
          <p>DataHive can make mistakes. Check important info.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;