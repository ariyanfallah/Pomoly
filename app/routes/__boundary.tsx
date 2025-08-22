import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useNavigate,
  useRouteError,
  type MetaFunction,
} from 'react-router';

// Constants for better maintainability
const ERROR_MESSAGES = {
  401: {
    title: 'احراز هویت مورد نیاز',
    message: 'برای دسترسی به این صفحه باید وارد شوید.',
  },
  403: {
    title: 'دسترسی ممنوع',
    message: 'شما اجازه دسترسی به این منبع را ندارید.',
  },
  404: {
    title: 'صفحه یافت نشد',
    message: 'صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.',
  },
  500: {
    title: 'خطای سرور',
    message: 'مشکلی از سمت ما پیش آمده است. در حال رفع آن هستیم.',
  },
  default: {
    title: 'مشکلی پیش آمد',
    message: 'خطای غیرمنتظره‌ای رخ داده است.',
  },
  application: {
    title: 'خطای برنامه',
    message: 'خطای غیرمنتظره‌ای رخ داده است. لطفاً صفحه را تازه‌سازی کنید.',
  },
  unknown: {
    title: 'خطای نامشخص',
    message: 'خطای غیرمنتظره‌ای رخ داده است. لطفاً صفحه را تازه‌سازی کنید.',
  },
} as const;

const RETRY_DELAY = 500;

export const meta: MetaFunction = (args) => {
  const error = args?.error;
  const isRouteError = error && isRouteErrorResponse(error);
  const statusCode = isRouteError ? error.status : null;

  return [
    {
      title: `${statusCode ? `${statusCode} - ` : ''}خطا - اکادمی آموزش آنلاین`,
    },
    {
      name: 'description',
      content: 'یک خطای رخ داده است در حال بررسی آن هستیم',
    },
    // Prevent indexing of error pages
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

interface ErrorDisplayProps {
  readonly title: string;
  readonly message: string;
  readonly statusCode?: number;
  readonly showRetry?: boolean;
  readonly showHome?: boolean;
  readonly showBack?: boolean;
}

// Memoized button components to prevent unnecessary re-renders
const RetryButton = ({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) => (
  <button
    type="button"
    onClick={onRetry}
    disabled={isRetrying}
    aria-label={isRetrying ? 'دوباره تلاش کنید...' : 'دوباره تلاش کنید'}
    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
    {isRetrying ? 'دوباره تلاش کنید...' : 'دوباره تلاش کنید'}
  </button>
);

const BackButton = ({ onGoBack }: { onGoBack: () => void }) => (
  <button
    type="button"
    onClick={onGoBack}
    aria-label="بازگشت به صفحه قبل"
    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
  >
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    بازگشت
  </button>
);

const HomeButton = () => (
  <Link
    to="/"
    aria-label="بازگشت به صفحه اصلی"
    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
  >
    <Home className="h-4 w-4" aria-hidden="true" />
    بازگشت به صفحه اصلی
  </Link>
);

function ErrorDisplay({
  title,
  message,
  statusCode,
  showRetry = true,
  showHome = true,
  showBack = false,
}: ErrorDisplayProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleRetry = useCallback(async () => {
    if (isRetrying) return;

    setIsRetrying(true);

    try {
      // Add a small delay to show loading state
      retryTimeoutRef.current = setTimeout(() => {
        window.location.reload();
      }, RETRY_DELAY);
    } catch (error) {
      console.error('Error during retry:', error);
      setIsRetrying(false);
    }
  }, [isRetrying]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Memoize the action buttons to prevent unnecessary re-renders
  const actionButtons = useMemo(
    () => (
      <div className="space-y-3" role="group" aria-label="Error page actions">
        {showRetry && <RetryButton onRetry={handleRetry} isRetrying={isRetrying} />}
        {showBack && <BackButton onGoBack={handleGoBack} />}
        {showHome && <HomeButton />}
      </div>
    ),
    [showRetry, showBack, showHome, handleRetry, handleGoBack, isRetrying]
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3" role="img" aria-label="Error icon">
              <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
          </div>

          {statusCode && (
            <div
              className="text-6xl font-bold text-muted-foreground"
              role="status"
              aria-label={`Error ${statusCode}`}
            >
              {statusCode}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>

        {actionButtons}
      </div>
    </div>
  );
}

export default function Boundary() {
  return <Outlet />;
}

// Enhanced error logging utility
const logError = (error: unknown, context: string = 'Route Error') => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.group(`🚨 ${context}`);
    console.error('Error object:', error);

    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }

    if (isRouteErrorResponse(error)) {
      console.error('Route error details:', {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      });
    }

    console.groupEnd();
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, {
      //   context,
      //   extra: isRouteErrorResponse(error) ? {
      //     status: error.status,
      //     statusText: error.statusText,
      //   } : undefined,
      // });
    } catch (loggingError) {
      console.error('Failed to log error to tracking service:', loggingError);
    }
  }
};

export function ErrorBoundary() {
  const error = useRouteError();

  // Enhanced error logging with proper cleanup
  useEffect(() => {
    logError(error);
  }, [error]);

  // Memoize error display props to prevent unnecessary re-renders
  const errorDisplayProps = useMemo((): ErrorDisplayProps => {
    // Handle React Router specific errors
    if (isRouteErrorResponse(error)) {
      const { status } = error;

      switch (status) {
        case 401:
          return {
            ...ERROR_MESSAGES[401],
            statusCode: 401,
            showRetry: false,
            showHome: true,
            showBack: false,
          };

        case 403:
          return {
            ...ERROR_MESSAGES[403],
            statusCode: 403,
            showRetry: false,
            showHome: true,
            showBack: true,
          };

        case 404:
          return {
            ...ERROR_MESSAGES[404],
            statusCode: 404,
            showRetry: false,
            showHome: true,
            showBack: true,
          };

        case 500:
          return {
            ...ERROR_MESSAGES[500],
            statusCode: 500,
            showRetry: true,
            showHome: true,
            showBack: false,
          };

        default:
          return {
            title: ERROR_MESSAGES.default.title,
            message: error.data?.message || error.statusText || ERROR_MESSAGES.default.message,
            statusCode: status,
            showRetry: true,
            showHome: true,
            showBack: true,
          };
      }
    }

    // Handle JavaScript errors
    if (error instanceof Error) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return {
        title: ERROR_MESSAGES.application.title,
        message: isDevelopment ? error.message : ERROR_MESSAGES.application.message,
        showRetry: true,
        showHome: true,
        showBack: false,
      };
    }

    // Handle unknown errors
    return {
      title: ERROR_MESSAGES.unknown.title,
      message: ERROR_MESSAGES.unknown.message,
      showRetry: true,
      showHome: true,
      showBack: false,
    };
  }, [error]);

  return <ErrorDisplay {...errorDisplayProps} />;
}
