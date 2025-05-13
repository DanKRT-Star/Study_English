import React from 'react';
import './index.css'
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../login/App';
import Homepage from '../homepage/homepage';
import Scene from '../scene/scene';
import StudentManagement from '../studentManagement/studentManagement';
import Reading from '../reading/reading';
import Listening from '../listening/listening';
import { AuthProvider } from '../authContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path='/scene' element={<Scene/>} />
        <Route path='/listening' element={<Listening/>} />
        <Route path='/reading' element={<Reading/>} />
        <Route path='/studentManagement' element={<StudentManagement/>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
