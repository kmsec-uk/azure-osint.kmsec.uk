// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { AADInfo, ResponseError } from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('TheService', () => {
	it('responds with 200 for /', async () => {
		const request = new IncomingRequest('http://self');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toMatchInlineSnapshot("200");
	});

	it('responds with 400 for /api/', async () => {
		const request = new IncomingRequest('http://self/api/');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toMatchInlineSnapshot("400");
	});

	it('responds with 400 for POST requests', async () => {
		const request = new IncomingRequest('http://self/api/', {
			method: "POST"
		});
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toMatchInlineSnapshot("400");
	});

	it('responds with 404 for arbitrary paths', async () => {
		const request = new IncomingRequest('http://self/example/');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toMatchInlineSnapshot("404");
	});

	it('responds with 200 and JSON content for contoso.org', async () => {
		const request = new IncomingRequest('http://self/api/?domain=contoso.org');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toMatchInlineSnapshot("200");
		const rsp_json: AADInfo = await response.json()
		expect(rsp_json.tenant_id).toMatchInlineSnapshot(`"fdd5b9d8-e5a3-462c-a4f4-085264aaf66b"`);
	});

	it('responds with 400 and JSON content for invalid domains', async () => {
		const request = new IncomingRequest('http://self/api/?domain=arbitrary');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		const rsp_json: ResponseError = await response.json()
		expect(response.status).toMatchInlineSnapshot("400");
		expect(rsp_json.error).toMatchInlineSnapshot(`"invalid tenant"`);
	});
});
