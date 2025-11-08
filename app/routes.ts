import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/__boundary/__app.tsx', [
    index('routes/__boundary/home.tsx'),
    route('*', 'routes/__boundary/404.tsx'),
  ]),
] satisfies RouteConfig;
