/// <reference types="@supabase/supabase-js" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { encode as base64url } from "https://deno.land/std@0.168.0/encoding/base64url.ts";

async function createStreamToken(userId: string, secret: string) {
  try {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      user_id: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iat: Math.floor(Date.now() / 1000),
      // Basic Stream Chat permissions
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
  } catch (error) {
    console.error('Token creation error:', error);
    throw error;
  }
}

serve(async (req: Request) => {
  try {
    const apiKey = Deno.env.get('STREAM_API_KEY');
    const apiSecret = Deno.env.get('STREAM_API_SECRET');

    console.log('=== Request Start ===');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    console.log('API Key:', apiKey?.substring(0, 5) + '...');
    console.log('API Secret:', apiSecret?.substring(0, 5) + '...');

    if (!apiKey || !apiSecret) {
      console.error('Missing credentials:', { apiKey: !!apiKey, apiSecret: !!apiSecret });
      throw new Error('Stream credentials not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No auth header present');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('Auth header present:', authHeader.substring(0, 20) + '...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const authToken = authHeader.replace('Bearer ', '');
    console.log('Getting user with token:', authToken.substring(0, 20) + '...');
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authToken);

    if (userError) {
      console.error('User fetch error:', userError);
      throw userError;
    }

    if (!user) {
      console.error('No user found in response');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('User found:', { id: user.id, email: user.email });
    console.log('Creating token with payload:', {
      user_id: user.id,
      role: 'user',
      permissions: ['ReadChannel', 'ReadChannelMembers', 'ReadMessageFlags', 'ReadOwnChannel']
    });

    const token = await createStreamToken(user.id, apiSecret);
    console.log('Token created:', token.substring(0, 20) + '...');
    console.log('=== Request End ===');

    return new Response(
      JSON.stringify({ token }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('=== Error ===');
    console.error('Full error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name,
        details: error.stack,
        cause: error.cause
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});