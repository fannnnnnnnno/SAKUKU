import { setTimeout as delay } from 'node:timers/promises';

const base = 'http://127.0.0.1:3000';
const jar = new Map();

function parseSetCookie(header) {
  if (!header) return null;
  const parts = header.split(';')[0].split('=');
  return { name: parts[0], value: parts.slice(1).join('=') };
}

async function request(path, options = {}) {
  const res = await fetch(base + path, {
    redirect: 'manual',
    ...options,
    headers: {
      ...(options.headers || {}),
      cookie: Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; '),
    },
  });

  const setCookies = res.headers.getSetCookie?.() || [];
  for (const header of setCookies) {
    const cookie = parseSetCookie(header);
    if (cookie) jar.set(cookie.name, cookie.value);
  }

  const body = await res.text();
  console.log('REQ', path, '=>', res.status, res.headers.get('location'));
  console.log(body.slice(0, 1000));
  return { res, body };
}

const csrf = await request('/api/auth/csrf');
const csrfToken = JSON.parse(csrf.body).csrfToken;

await request('/api/auth/callback/credentials', {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    csrfToken,
    email: 'hudapacul2019@gmail.com',
    password: 'Alfiyyn123',
  }),
});
