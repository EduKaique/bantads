import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const token = resolveToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};

function resolveToken(): string | null {
  const storedToken = localStorage.getItem('token');

  if (storedToken) {
    return storedToken;
  }

  const currentUser = localStorage.getItem('currentUser');

  if (!currentUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(currentUser) as { access_token?: unknown };
    return typeof parsedUser.access_token === 'string'
      ? parsedUser.access_token
      : null;
  } catch {
    return null;
  }
}
