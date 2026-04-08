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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("Logged-in user:", user);

  const { data: existingUser, error: dbError } = await supabase
    .from("user") 
    .select("id, role, avatarimage, username")
    .eq("email", user.email)
    .maybeSingle();

  if (dbError || !existingUser) {
    console.log("[ERROR] Unauthorized user:", user.email);

    await supabase.auth.signOut();

    return NextResponse.redirect(
      new URL("/?error=unauthorized_user", request.url)
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = user.user_metadata?.full_name || "User"

  const needsUpdate = 
    existingUser.avatarimage !== avatarUrl || 
    existingUser.username !== fullName;

  if (needsUpdate) {
    console.log("[UPDATE] Updating user avatar/name for:", user.email);
    const { error: updateError } = await supabase
      .from("user")
      .update({
        avatarimage: avatarUrl || existingUser.avatarimage,
        username: fullName || existingUser.username,
      })
      .eq("email", user.email);

    if (updateError) {
      console.error("Update error:", updateError.message);
    }
  }


  console.log("[SUCCESS] Authorized user:", user.email);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}