import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	if (request.method !== 'POST') {
		return NextResponse.next();
	}

	const { pathname } = request.nextUrl;

	// If it's a Server Action submission, do NOT rewrite. Server Actions carry these headers.
	const isServerAction =
		request.headers.has('next-action') ||
		request.headers.has('next-router-state-tree') ||
		request.headers.get('content-type')?.includes('multipart/form-data') === true;

	if (isServerAction) {
		return NextResponse.next();
	}

	// /pacientes/new -> /api/pacientes/new
	if (pathname === '/pacientes/new') {
		const url = new URL('/api/pacientes/new', request.url);
		return NextResponse.rewrite(url);
	}

	// /pacientes/:id/edit -> /api/pacientes/:id/edit
	const editMatch = pathname.match(/^\/pacientes\/([^/]+)\/edit$/);
	if (editMatch) {
		const id = editMatch[1];
		const url = new URL(`/api/pacientes/${id}/edit`, request.url);
		return NextResponse.rewrite(url);
	}

	// POST to /pacientes (delete action) -> /api/pacientes
	if (pathname === '/pacientes') {
		const url = new URL('/api/pacientes', request.url);
		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/pacientes/:path*'],
};