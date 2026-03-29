import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error.message);
      return NextResponse.redirect(new URL("/?error=auth", request.url));
    }
  }

  // ✅ Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Logged-in user:", user);

  if (user) {
    // 🔍 Check if user already exists
    const { data: existingUser } = await supabase
      .from("user")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!existingUser) {
      // ✅ Insert new user
      const { error: insertError } = await supabase.from("user").insert([
        {
          email: user.email,
          username: user.user_metadata?.full_name || "New User",
          avatarimage: user.user_metadata?.avatar_url || null,
          role: "project_manager", // ⚠️ must match your enum
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError.message);
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}