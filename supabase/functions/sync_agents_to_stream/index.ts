import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {StreamChat} from "npm:stream-chat"

const serverClient = StreamChat.getInstance(
  Deno.env.get("STREAM_API_KEY")!,
  Deno.env.get("STREAM_API_SECRET")!,
)

Deno.serve(async (req) => {
  try {
    const data = await req.json()
    console.log("Received data:", data);
    
    const agent = data?.agent
    if (!agent?.id) {
      console.log("No agent id found in:", agent);
      return new Response(
        JSON.stringify({
          error: "User is required",
          receivedData: data
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = {
      id: agent.id,
      name: agent.name,
      image: agent.image,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      online: true,
      role: "admin",
    }

    if (agent.avatar) {
      user.image = `https://ftbiaqoikfkvyngporex.supabase.co/storage/v1/object/public/avatars/${agent.avatar}`
    }

    console.log("Creating Stream user with data:", {
      id: agent.id,
      name: agent.name
    });

    console.log("Attempting to sync user:", user);
    await serverClient.upsertUsers([user]); // Note: upsertUsers expects an array
    console.log("Successfully synced agent to Stream");

    return new Response(
      JSON.stringify({ 
        ok: true,
        syncedUser: user 
      }),
      { headers: { "Content-Type": "application/json" } },
    )

  } catch (error) {
    console.error("Error in sync_agents_to_stream:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        streamError: error.response?.data 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})
