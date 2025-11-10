export function setCookie(name: string, value: string, days = 180): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const key = encodeURIComponent(name) + '=';
  const parts = document.cookie.split('; ');
  for (const p of parts) {
    if (p.startsWith(key)) return decodeURIComponent(p.substring(key.length));
  }
  return null;
}

export function eraseCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
