import { StreamChat } from "npm:stream-chat"

const serverClient = StreamChat.getInstance(
  Deno.env.get("STREAM_API_KEY")!,
  Deno.env.get("STREAM_API_SECRET")!,
)

Deno.serve(async (req) => {
  try {
    const { matchId, userId, agentId, agentName } = await req.json()
    
    // Validate inputs
    if (!matchId || !userId || !agentId || !agentName) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: { matchId, userId, agentId, agentName } 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" } 
        }
      )
    }

    console.log("Creating channel with:", { matchId, userId, agentId, agentName });

    const channel = serverClient.channel('messaging', matchId, {
      members: [userId, agentId],
      created_by_id: userId,
      name: `Chat with ${agentName}`,
    });

    await channel.create();

    console.log("Channel created successfully");

    return new Response(
      JSON.stringify({ 
        ok: true,
        channel: matchId 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error in create-match-channel:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}) 