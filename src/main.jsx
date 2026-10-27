import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './auth/msalInstance';
import App from './App';
import {PermissionsProvider} from './auth/Permissions';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <MsalProvider instance={msalInstance}>
    <BrowserRouter>
      <PermissionsProvider><App /></PermissionsProvider>
    </BrowserRouter>
  </MsalProvider>,
);
