import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { loginUser } from "../../services/firebase";

const Login = ({ userType }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setError('');
      const { user, userData } = await loginUser(values.email, values.password, userType.toLowerCase());
        
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', userType);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('username', userData.username);
        
      navigate(userType === 'Teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{userType} Login</h2>
      {error && <div className="error-message">{error}</div>}
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="auth-form">
            <div className="form-group">
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="form-input"
              />
              {errors.email && touched.email && (
                <div className="error">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="form-input"
              />
              {errors.password && touched.password && (
                <div className="error">{errors.password}</div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
      <p className="auth-link">
        Don't have an account?{' '}
        <span
          onClick={() =>
            navigate(userType === 'Teacher' ? '/teacher/signup' : '/student/signup')
          }
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
};

export default Login;