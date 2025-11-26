import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

export default [
  {
    name: 'Tanstack Query',
    render: <ReactQueryDevtoolsPanel />,
    defaultOpen: true,
  },
  {
    name: 'Tanstack Router',
    render: <TanStackRouterDevtoolsPanel />,
  }
];
