import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <GoogleOAuthProvider clientId="701758211704-4jhmevq487fhk8oo8i4lnsv92qql0h1c.apps.googleusercontent.com">
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
