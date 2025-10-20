import AppProviders from './app/providers';
import AppRoutes from './app/routes';
import './services/interceptors'; 


function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
