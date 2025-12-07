import { getRouterContext, router } from '@/router';
import { RouterProvider } from '@tanstack/react-router';

const App = () => {
  return <RouterProvider router={router} context={getRouterContext()} />;
};

export default App;
