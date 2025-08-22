import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/__boundary/__app.tsx', [
    index('routes/__boundary/home.tsx'),
    route('api/auth/callback', 'routes/api/auth/callback.tsx'),

    layout('routes/__boundary.tsx', [
      layout('routes/__boundary/__public.tsx', [
        route('auth', 'routes/__boundary/__public/auth.tsx'),
      ]),

      layout('routes/__boundary/__private.tsx', [

      ]),
    ]),
  ]),
] satisfies RouteConfig;
