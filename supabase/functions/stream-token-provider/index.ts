/// <reference types="@supabase/supabase-js" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { encode as base64url } from "https://deno.land/std@0.168.0/encoding/base64url.ts";

async function createStreamToken(userId: string, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    role: 'admin',
    type: 'messaging',
    permission: 'read, write, create, delete, update',
    access: 'channel',
    grants: {
      messaging: ['read', 'write', 'create', 'delete', 'update']
    }
  };

  const encoder = new TextEncoder();
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64url(encoder.encode(JSON.stringify(payload)));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = base64url(
    new Uint8Array(
      await crypto.subtle.sign(
        { name: 'HMAC', hash: 'SHA-256' },
        key,
        encoder.encode(`${headerB64}.${payloadB64}`)
      )
    )
  );

  return `${headerB64}.${payloadB64}.${signature}`;
}

serve(async (req: Request) => {
  try {
    const apiKey = Deno.env.get('STREAM_API_KEY');
    const apiSecret = Deno.env.get('STREAM_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('Stream credentials not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const authToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authToken);

    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = await createStreamToken(user.id, apiSecret);

    return new Response(
      JSON.stringify({ token }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});