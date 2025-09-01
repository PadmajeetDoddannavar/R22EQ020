import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import ShortenerPage from './components/ShortenerPage';
import StatsPage from './components/StatsPage';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<ShortenerPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path=":shortcode" element={<ShortenerPage />} /> {/* same app handles redirect */}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
