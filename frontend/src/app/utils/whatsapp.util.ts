import { Property } from '../components/models/property.model';

// Función para formatear el teléfono
const toE164 = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('52')) return `+${digits}`;
  if (digits.length === 10) return `+52${digits}`;
  return `+${digits}`;
};

export function buildWhatsappUrl(p: Property): string {
  // Tu modelo 'Property' no tiene un campo 'contactWhatsapp'.
  // Usamos un número de teléfono fijo por ahora (el que tenías en tu WhatsappButton).
  const agentPhone = '5218330000000'; // <-- CAMBIA ESTE NÚMERO
  const phone = toE164(agentPhone);

  // Usamos los campos en español
  const price = (p.precio ?? null) ?? (p.precio_alquiler ?? null);
  
  const txt =
    `Hola, me interesa la propiedad "${p.titulo}"` +
    (price ? ` (con precio de ${price} MXN)` : '') +
    (p.direccion ? ` en ${p.direccion}` : '');

  return `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(txt)}`;
}
