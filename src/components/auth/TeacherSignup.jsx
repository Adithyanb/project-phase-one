import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { registerUser } from "../../services/firebase";

const TeacherSignup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    specialPasskey: Yup.string().required('Special passkey is required'),
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
      if (values.specialPasskey !== '1234') {
        throw new Error('Invalid teacher passkey');
      }
      
      await registerUser(values.email, values.password, 'teacher', values.username);
      navigate('/teacher/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Teacher Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      <Formik
        initialValues={{
          username: '',
          email: '',
          specialPasskey: '',
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
                <div className="error">{errors.username}</div>
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
                <div className="error">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <Field
                type="text"
                name="specialPasskey"
                placeholder="Special Passkey"
                className="form-input"
              />
              {errors.specialPasskey && touched.specialPasskey && (
                <div className="error">{errors.specialPasskey}</div>
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

            <div className="form-group">
              <Field
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="form-input"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="error">{errors.confirmPassword}</div>
              )}
            </div>
            
            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </Form>
        )}
      </Formik>
      <p className="auth-link">
        Already have an account?{' '}
        <span onClick={() => navigate('/teacher/login')}>Login</span>
      </p>
    </div>
  );
};

export default TeacherSignup;