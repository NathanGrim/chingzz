// Vercel Serverless Function - Kitchen Status (Upstash Redis)

export default async function handler(req, res) {
    // Enable CORS for all origins (allows separate control website if desired)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Never cache this endpoint so changes reflect immediately
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Dynamically detect Upstash / Vercel KV environment variables (supports any prefix like KV_, UPSTASH_, STORAGE_)
    const envKeys = Object.keys(process.env);
    const urlKey = envKeys.find(k => k.endsWith('_REST_API_URL') || k.endsWith('_REST_URL') || k === 'UPSTASH_REDIS_REST_URL' || k === 'KV_REST_API_URL');
    const tokenKey = envKeys.find(k => k.endsWith('_REST_API_TOKEN') || k.endsWith('_REST_TOKEN') || k === 'UPSTASH_REDIS_REST_TOKEN' || k === 'KV_REST_API_TOKEN');

    const redisUrl = (urlKey && process.env[urlKey]) || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const redisToken = (tokenKey && process.env[tokenKey]) || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    const ADMIN_PIN = process.env.ADMIN_PIN || '1234'; // Default PIN is 1234, change in Vercel settings

    const REDIS_KEY = 'bongchingzz_kitchen_status';

    // Default fallback state if database is empty or not yet connected
    const defaultState = {
        isOpen: true,
        message: 'Welcome to বং Chingzz! We are open and taking orders.',
        updatedAt: new Date().toISOString()
    };

    // Helper: Call Upstash Redis REST API
    async function redisCommand(command, ...args) {
        if (!redisUrl || !redisToken) {
            return null; // Local development or keys not yet configured
        }

        const url = `${redisUrl}/${command}/${args.map(encodeURIComponent).join('/')}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${redisToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Upstash error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
    }

    try {
        // --- GET: Fetch current kitchen status ---
        if (req.method === 'GET') {
            if (!redisUrl || !redisToken) {
                // If Upstash keys aren't set in Vercel yet, gracefully return default
                return res.status(200).json({
                    ...defaultState,
                    _configured: false,
                    _note: 'Upstash Redis environment variables not yet set. Defaulting to OPEN.'
                });
            }

            const raw = await redisCommand('get', REDIS_KEY);

            if (!raw) {
                return res.status(200).json({
                    ...defaultState,
                    _configured: true
                });
            }

            let parsed;
            try {
                parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            } catch {
                parsed = { isOpen: raw === 'true', message: '' };
            }

            return res.status(200).json({
                isOpen: Boolean(parsed.isOpen),
                message: parsed.message || '',
                updatedAt: parsed.updatedAt || new Date().toISOString(),
                _configured: true
            });
        }

        // --- POST: Update kitchen status (Admin only) ---
        if (req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
            const { isOpen, message, pin } = body;

            // Simple security PIN check
            if (pin !== ADMIN_PIN) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid PIN. Please check your admin PIN.'
                });
            }

            const newState = {
                isOpen: Boolean(isOpen),
                message: typeof message === 'string' ? message.trim() : '',
                updatedAt: new Date().toISOString()
            };

            if (!redisUrl || !redisToken) {
                return res.status(500).json({
                    success: false,
                    error: 'Upstash Redis is not connected yet. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel project settings.'
                });
            }

            await redisCommand('set', REDIS_KEY, JSON.stringify(newState));

            return res.status(200).json({
                success: true,
                status: newState
            });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (err) {
        console.error('Kitchen status API error:', err);
        return res.status(500).json({
            error: err.message || 'Internal Server Error',
            fallback: defaultState
        });
    }
}

