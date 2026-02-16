import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initEcho } from './echo';
import { initializeTheme } from './hooks/use-appearance';

// Silently ignore Inertia prefetch aborted errors
window.addEventListener('unhandledrejection', (event) => {
    if (
        event.reason &&
        typeof event.reason === 'object' &&
        'message' in event.reason &&
        event.reason.message === 'Request aborted'
    ) {
        event.preventDefault();
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Initialize Laravel Echo for real-time broadcasting
initEcho();
