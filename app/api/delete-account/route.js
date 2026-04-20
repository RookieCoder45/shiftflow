import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔴 secret key (server only)
);

export async function POST(req) {
  const { userId } = await req.json();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}