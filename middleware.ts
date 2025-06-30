import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('leao_token')?.value;
  const userStr = request.cookies.get('leao_user')?.value;
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      // Invalid user data, treat as not authenticated
    }
  }

  const { pathname } = request.nextUrl;
  const isAuthenticated = !!(token && user);
  
  // Define protected routes for each user type
  const candidatoRoutes = ['/candidato/dashboard', '/candidato/vagas', '/candidato/perfil', '/candidato/entrevistas', '/candidato/beneficios', '/candidato/cursos', '/candidato/cultural'];
  const empresaRoutes = ['/empresa/dashboard', '/empresa/candidatos', '/empresa/vagas', '/empresa/perfil', '/empresa/entrevistas', '/empresa/beneficios', '/empresa/treinamento', '/empresa/agendarentrevista'];
  const adminRoutes = ['/admin'];
  
  // Check if the current path is a protected route
  const isCandidatoRoute = candidatoRoutes.some(route => pathname.startsWith(route));
  const isEmpresaRoute = empresaRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  
  // If accessing protected route without authentication
  if (!isAuthenticated) {
    if (isCandidatoRoute) {
      return NextResponse.redirect(new URL('/candidato/login', request.url));
    }
    if (isEmpresaRoute) {
      return NextResponse.redirect(new URL('/empresa/login', request.url));
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // If authenticated, check if user is accessing correct area
  if (isAuthenticated && user) {
    const userType = user.type;
    
    // Redirect to correct dashboard if accessing wrong area
    if (userType === 'candidato' && isEmpresaRoute) {
      return NextResponse.redirect(new URL('/candidato/dashboard', request.url));
    }
    if (userType === 'candidato' && isAdminRoute) {
      return NextResponse.redirect(new URL('/candidato/dashboard', request.url));
    }
    if (userType === 'empresa' && isCandidatoRoute) {
      return NextResponse.redirect(new URL('/empresa/dashboard', request.url));
    }
    if (userType === 'empresa' && isAdminRoute) {
      return NextResponse.redirect(new URL('/empresa/dashboard', request.url));
    }
    if (userType === 'admin' && (isCandidatoRoute || isEmpresaRoute)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // Redirect from login pages if already authenticated
    if (pathname === '/candidato/login' && userType === 'candidato') {
      return NextResponse.redirect(new URL('/candidato/dashboard', request.url));
    }
    if (pathname === '/empresa/login' && userType === 'empresa') {
      return NextResponse.redirect(new URL('/empresa/dashboard', request.url));
    }
    if (pathname === '/admin/login' && userType === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/candidato/:path*',
    '/empresa/:path*',
    '/admin/:path*'
  ]
}; 