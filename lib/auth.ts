import { createClient } from "./supabase/server";
import { createServiceClient } from "./supabase/service";
import type { User } from "@supabase/supabase-js";

/**
 * Check if a user is an admin
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Admin check error:", error.message);
    return false;
  }

  // data will be null if no admin record found, which is fine
  return !!data;
}

/**
 * Get current user and admin status
 */
export async function getCurrentUser(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, isAdmin: false };
  }

  const isAdmin = await checkIsAdmin(user.id);

  return { user, isAdmin };
}

/**
 * Auto-enroll user as admin if email is in ADMIN_EMAILS
 */
export async function autoEnrollAdmin(user: User): Promise<boolean> {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0) || [];

  console.log("Checking admin emails:", adminEmails);
  console.log("User email:", user.email);

  if (!adminEmails.includes(user.email || "")) {
    console.log("User email not in admin list");
    return false;
  }

  // Use service role client to bypass RLS
  const supabase = createServiceClient();

  // Check if user is already an admin
  const { data: existingAdmin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingAdmin) {
    console.log("User is already an admin");
    return true; // Already an admin
  }

  // Insert as admin using service role
  const { error } = await supabase.from("admins").insert({
    user_id: user.id,
    role: "admin",
  });

  if (error) {
    console.error("Error enrolling admin:", error);
    return false;
  }

  console.log(`Auto-enrolled admin: ${user.email}`);
  return true;
}
