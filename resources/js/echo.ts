import Echo from 'laravel-echo';

// 扩展Window接口以支持Pusher
declare global {
    interface Window {
        Pusher?: unknown;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Echo?: Echo<any>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        echoReadyPromise?: Promise<Echo<any> | null>;
    }
}

// 获取CSRF Token的函数
const getCsrfToken = (): string => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

// 创建Echo实例
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createEcho = (): Promise<Echo<any> | null> => {
    // 检查环境变量
    const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
    const reverbHost = import.meta.env.VITE_REVERB_HOST || 'localhost';
    const reverbPort = import.meta.env.VITE_REVERB_PORT || 8080;
    const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

    console.log('[Echo] 配置检查:', {
        key: reverbKey ? '已设置' : '未设置',
        host: reverbHost,
        port: reverbPort,
        scheme: reverbScheme,
    });

    if (!reverbKey) {
        console.warn('[Echo] ❌ Reverb未配置，广播功能不可用。请检查 VITE_REVERB_APP_KEY 环境变量');
        return Promise.resolve(null);
    }

    // 如果已经有初始化Promise，直接返回
    if (window.echoReadyPromise) {
        console.log('[Echo] 使用已存在的初始化Promise');
        return window.echoReadyPromise;
    }

    console.log('[Echo] 开始初始化Pusher...');

    // 创建初始化Promise
    window.echoReadyPromise = import('pusher-js').then((PusherModule) => {
        console.log('[Echo] Pusher模块加载成功');
        const Pusher = PusherModule.default || PusherModule;
        window.Pusher = Pusher;

        // 创建Echo实例 - 使用Reverb兼容配置
        const isHttps = reverbScheme === 'https';
        const config = {
            broadcaster: 'reverb' as const,
            key: reverbKey,
            wsHost: reverbHost,
            wsPort: isHttps ? undefined : Number(reverbPort),
            wssPort: isHttps ? Number(reverbPort) : undefined,
            forceTLS: isHttps,
            enabledTransports: isHttps ? ['wss' as const] : ['ws' as const],
            disableStats: true,
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            },
            withCredentials: true,
        };

        console.log('[Echo] Echo配置:', config);

        window.Echo = new Echo(config as unknown as ConstructorParameters<typeof Echo>[0]);
        console.log('[Echo] Echo实例创建成功');

        // 监听连接状态
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connector = (window.Echo as any).connector;
        connector.pusher.connection.bind('connected', () => {
            console.log('[Echo] ✅ Reverb连接成功');
        });

        connector.pusher.connection.bind('disconnected', () => {
            console.log('[Echo] ⚠️ Reverb连接断开');
        });

        connector.pusher.connection.bind('connecting', () => {
            console.log('[Echo] 🔄 Reverb正在连接...');
        });

        connector.pusher.connection.bind('error', (error: unknown) => {
            console.error('[Echo] ❌ Reverb连接错误:', error);
        });

        // 监听认证错误
        connector.pusher.bind('pusher:subscription_error', (error: unknown) => {
            console.error('[Echo] ❌ 订阅错误:', error);
        });

        console.log(`[Echo] ✅ Echo初始化完成，连接地址: ${reverbScheme}://${reverbHost}:${reverbPort}`);
        return window.Echo;
    }).catch((error) => {
        console.error('[Echo] ❌ Pusher加载失败:', error);
        return null;
    });

    return window.echoReadyPromise;
};

// 获取Echo实例（同步）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEcho = (): Echo<any> | null => {
    return window.Echo || null;
};

// 获取Echo实例（异步，确保已初始化）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEchoAsync = async (): Promise<Echo<any> | null> => {
    if (window.echoReadyPromise) {
        return window.echoReadyPromise;
    }
    return createEcho();
};

// 初始化Echo
export const initEcho = (): void => {
    createEcho();
};

export default getEcho;
