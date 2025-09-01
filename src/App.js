import React, { useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Header from './components/Header';
import { handleRedirectIfShortcode } from './services/urlService';
import loggingMiddleware from './middleware/loggingMiddleware';

export default function App() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // IMPORTANT: This is the FIRST function called related to app actions.
  // We will call the logging middleware here to register app-start and any incoming shortcode redirect attempt.
  useEffect(() => {
    // integrate logging middleware from the very first app action
    loggingMiddleware('app_start', { path: location.pathname, search: location.search });
  }, []); // run once on mount

  // If route contains shortcode in params, attempt redirect
  useEffect(() => {
    // If there is a shortcode param, attempt client-side redirect
    const { shortcode } = params || {};
    if (shortcode) {
      // Wrap in async function
      (async () => {
        const result = await handleRedirectIfShortcode(shortcode);
        if (result && result.success) {
          // navigate to a temporary "redirecting" route that will change window.location
          window.location.href = result.target; // perform actual redirect to the long URL
          // Note: Logging performed inside the service/middleware
        } else {
          // navigate back to root with query param to show error
          navigate(`/?redirect_error=${encodeURIComponent(result && result.message ? result.message : 'Not found')}`);
        }
      })();
    }
  }, [params, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Header />
      <Outlet />
    </Container>
  );
}
