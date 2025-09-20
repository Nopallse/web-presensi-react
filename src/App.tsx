import AppProviders from './app/providers';
import AppRoutes from './app/routes';
import './services/interceptors'; // Import interceptors to initialize them

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
