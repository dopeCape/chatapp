import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginScreen from './Screens/LoginScreen';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/login',
    element: <LoginScreen />
  }
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);
