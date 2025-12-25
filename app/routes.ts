import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/__boundary/__app.tsx', [
    index('routes/__boundary/home.tsx'),

    layout('routes/__boundary.tsx', [
      layout('routes/__boundary/__public.tsx', [
        route('auth', 'routes/__boundary/__public/auth.tsx'),
        route('auth/callback', 'routes/__boundary/__public/auth.callback.tsx'),
      ]),

      layout('routes/__boundary/__private.tsx', [

      ]),
    ]),
    
    route('*', 'routes/__boundary/404.tsx'),
  ]),
] satisfies RouteConfig;
