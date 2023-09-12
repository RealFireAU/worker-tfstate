// Version: 1.0
// Description: Router for the Terraform State API
// Web Path: /api/v1/*
import { RouterExtended } from './types/Router';
import { Router, RouterType } from 'itty-router';

const router = Router() as RouterType & RouterExtended;

let STATE_NAMESPACE: KVNamespace;
let USERNAME: string;
let PASSWORD: string;
let expectedToken: string;

const STATE_KEY_PREFIX = 'state::';
const LOCK_KEY_PREFIX = 'lock::';
const PATH_PREFIX = '/api/v1/';

router.get('*', async (request) => {
	const path = new URL(request.url).pathname.replace(PATH_PREFIX, '');
	return await getState(path);
});

router.post('*', async (request) => {
	const path = new URL(request.url).pathname.replace(PATH_PREFIX, '');
	return await setState(path, await request.text());
});

router.delete('*', async (request) => {
	const path = new URL(request.url).pathname.replace(PATH_PREFIX, '');
	return await deleteState(path);
});

router.lock('*', async (request) => {
	const path = new URL(request.url).pathname.replace(PATH_PREFIX, '');
	return await lockState(path, await request.text());
});

router.unlock('*', async (request) => {
	const path = new URL(request.url).pathname.replace(PATH_PREFIX, '');
	return await unlockState(path);
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	STATE_NAMESPACE = env.tfstate;
	USERNAME = env.USERNAME;
	PASSWORD = env.PASSWORD;
	expectedToken = btoa([USERNAME, PASSWORD].join(':'));
	try {
		const auth = request.headers.get('Authorization');
		if (!auth || auth !== `Basic ${expectedToken}`) {
			return new Response('Unauthorized', { status: 401 });
		}
		const res = await router.handle(request, env, ctx);
		return res;
	} catch (err: any) {
		console.error(err.stack || err);
		return new Response(err.stack || err, { status: 500 });
	}
}

async function getState(path: string) {
	const state = await STATE_NAMESPACE.get(STATE_KEY_PREFIX + path);
	if (!state) {
		return new Response('', {
			status: 404,
			headers: {
				'Cache-Control': 'no-store',
			},
		});
	}

	return new Response(state || '', {
		headers: {
			'Content-type': 'application/json',
			'Cache-Control': 'no-store',
		},
	});
}
async function setState(path: string, body: string) {
	await STATE_NAMESPACE.put(STATE_KEY_PREFIX + path, body);
	return new Response(body || '', {
		status: 200,
		headers: {
			'Content-type': 'application/json',
			'Cache-Control': 'no-store',
		},
	});
}
async function deleteState(path: string) {
	await STATE_NAMESPACE.delete(STATE_KEY_PREFIX + path);
	return new Response('', {
		status: 200,
		headers: {
			'Cache-Control': 'no-store',
		},
	});
}

async function lockState(path: string, body: string) {
	const existingLock = await STATE_NAMESPACE.get(LOCK_KEY_PREFIX + path);
	if (existingLock) {
		return new Response(existingLock, {
			status: 423,
			headers: {
				'Content-type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}
	await STATE_NAMESPACE.put(LOCK_KEY_PREFIX + path, body);
	return new Response(body, {
		headers: {
			'Content-type': 'application/json',
			'Cache-Control': 'no-store',
		},
	});
}

async function unlockState(path: string) {
	await STATE_NAMESPACE.delete(LOCK_KEY_PREFIX + path);
	return new Response('', {
		headers: {
			'Cache-Control': 'no-store',
		},
	});
}

export default handleRequest;
