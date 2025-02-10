
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "jsr:@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)
const AI_SERVER_URL = 'https://b766-84-126-250-212.ngrok-free.app'

export const post = async (url: string, data: unknown = {}) => {
  try {
    console.log('Making request to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Network Error:', {
      message: error.message,
      url,
      data
    });
    throw error;
  }
};

const notifyMatch = async (match: any) => {
  await post(`${AI_SERVER_URL}/new-ai-message`, { channel_id: match.id });
}

Deno.serve(async (req) => {
  const { data:matches, error } = await supabase.from("matches").select("*").order('created_at', { ascending: false }); 

  if (error) {
    console.error(error);
  }
  const filteredMatches = matches.slice(0, 3);
 await Promise.all(filteredMatches.map(notifyMatch)); 

  return new Response(
    JSON.stringify({ success: true, message: "Matches notified" }),
    { headers: { "Content-Type": "application/json" } },
  )
})
