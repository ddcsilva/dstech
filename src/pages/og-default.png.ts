import type { APIRoute } from 'astro';
import { generateOgImage } from '../utils/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage({
    title: 'Danilo Silva',
    subtitle: 'Engenheiro de Software Sênior | .NET & Angular | Modernização de Sistemas',
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
