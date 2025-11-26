import App from '@/App';
import { Toaster } from '@/components/ui/sonner';
import { getContext } from '@/integrations/tanstack-query/helpers.ts';
import * as TanStackQueryProvider from '@/integrations/tanstack-query/root-provider.tsx';
import reportWebVitals from '@/reportWebVitals.ts';
import '@/styles.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

const TanStackQueryProviderContext = getContext();

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <App />
        <Toaster />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
if (import.meta.env.DEV) {
  reportWebVitals(console.log);
}
