import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserButtons.css';

const UserButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="buttons-container">
      <button
        className="btn btn-teachers"
        onClick={() => navigate('/teacher/login')}
      >
        Teachers
      </button>
      <button
        className="btn btn-students"
        onClick={() => navigate('/student/login')}
      >
        Students
      </button>
    </div>
  );
};

export default UserButtons;