import type { APIRoute } from 'astro';
import { paraphraseText } from '../../lib/translate';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (text.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Text must be 500 characters or less' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const steps = await paraphraseText(text);
    const finalResult = steps[steps.length - 1]?.text || text;

    return new Response(
      JSON.stringify({ success: true, steps, result: finalResult }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error:', msg);
    return new Response(
      JSON.stringify({ error: `Gagal menerjemahkan: ${msg}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};