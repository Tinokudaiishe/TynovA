import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[TSOA PMS] Supabase env vars missing. Running in offline/mock mode.\n" +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/* ─── DB helpers ─────────────────────────────────────────────── */

export const db = {
  /* ── Reports ── */
  async getReports() {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("date", { ascending: false });
    if (error) { console.error("getReports:", error); return null; }
    return data;
  },
  async addReport(report) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("reports")
      .insert([report])
      .select()
      .single();
    if (error) { console.error("addReport:", error); return null; }
    return data;
  },
  async deleteReport(id, userId) {
    if (!supabase) return false;
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) { console.error("deleteReport:", error); return false; }
    return true;
  },

  /* ── Documents ── */
  async getDocuments() {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("getDocuments:", error); return null; }
    return data;
  },
  async addDocument(doc) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("documents")
      .insert([doc])
      .select()
      .single();
    if (error) { console.error("addDocument:", error); return null; }
    return data;
  },
  async deleteDocument(id, userId) {
    if (!supabase) return false;
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) { console.error("deleteDocument:", error); return false; }
    return true;
  },

  /* ── Problems / Action Tracker ── */
  async getProblems() {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("getProblems:", error); return null; }
    return data;
  },
  async addProblem(prob) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("problems")
      .insert([prob])
      .select()
      .single();
    if (error) { console.error("addProblem:", error); return null; }
    return data;
  },
  async updateProblem(id, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("problems")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) { console.error("updateProblem:", error); return null; }
    return data;
  },
  async deleteProblem(id, userId) {
    if (!supabase) return false;
    const { error } = await supabase
      .from("problems")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) { console.error("deleteProblem:", error); return false; }
    return true;
  },

  /* ── Sign-in Records ── */
  async getSignins(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("signin_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) { console.error("getSignins:", error); return null; }
    return data;
  },
  async getAllSignins() {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("signin_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("getAllSignins:", error); return null; }
    return data;
  },
  async addSignin(record) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("signin_records")
      .insert([record])
      .select()
      .single();
    if (error) { console.error("addSignin:", error); return null; }
    return data;
  },

  /* ── Projects ── */
  async getProjects() {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_actions(*)")
      .order("created_at", { ascending: false });
    if (error) { console.error("getProjects:", error); return null; }
    return data;
  },
  async addProject(proj) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("projects")
      .insert([proj])
      .select()
      .single();
    if (error) { console.error("addProject:", error); return null; }
    return data;
  },
};
