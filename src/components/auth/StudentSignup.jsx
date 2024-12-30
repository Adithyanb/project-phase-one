import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../../services/firebase';

const StudentSignup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      console.log('Starting registration process...');
      
      await registerUser(values.email, values.password, 'student', values.username);
      
      console.log('User registered successfully');
      navigate('/student/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Student Sign Up</h2>
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="auth-form">
            <div className="form-group">
              <Field
                type="text"
                name="username"
                placeholder="Username"
                className="form-input"
              />
              {errors.username && touched.username && (
                <div className="error" style={{ color: 'red' }}>{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="form-input"
              />
              {errors.email && touched.email && (
                <div className="error" style={{ color: 'red' }}>{errors.email}</div>
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
                <div className="error" style={{ color: 'red' }}>{errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <Field
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="form-input"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="error" style={{ color: 'red' }}>{errors.confirmPassword}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-button" 
              disabled={isSubmitting}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </Form>
        )}
      </Formik>
      <p className="auth-link">
        Already have an account?{' '}
        <span 
          onClick={() => navigate('/student/login')} 
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default StudentSignup;