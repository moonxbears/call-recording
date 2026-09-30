import { supabase } from "@/api/supabaseClient";

const isNode = typeof window === "undefined";

const isClearAccessTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get("clear_access_token") === "true";

const clearStoredAccessToken = async () => {
  if (!isNode) {
    // Clean up old legacy keys
    window.localStorage.removeItem("base44_access_token");
    window.localStorage.removeItem("token");

    // Clear active Supabase session and storage key
    await supabase.auth.signOut();
  }
};

export const getAppParams = () => {
  if (isClearAccessTokenRequested()) {
    clearStoredAccessToken();
  }

  return {
    appName: "Signal Intercept Log",
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
};

export const appParams = getAppParams();
export default appParams;