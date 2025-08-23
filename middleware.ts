import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	if (request.method !== 'POST') {
		return NextResponse.next();
	}

	const { pathname } = request.nextUrl;

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