import apiRouter from './router';
import { Env } from './types/env';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const path = new URL(request.url).pathname;
		if (path === '/health') {
			return new Response('OK', { status: 200 });
		}
		
		if (path.startsWith('/api/v1')) {
			return apiRouter(request, env, ctx);
		}

		return new Response('Not Found.', { status: 404 });
	}
};
