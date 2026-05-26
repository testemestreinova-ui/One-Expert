// Tipos gerados manualmente. Depois do setup do Supabase, rode:
// npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "admin" | "owner";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin" | "owner";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin" | "owner";
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: "starter" | "plus" | "ultra";
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          plan?: "starter" | "plus" | "ultra";
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          logo_url?: string | null;
          plan?: "starter" | "plus" | "ultra";
          settings?: Json;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          joined_at?: string;
        };
        Update: {
          role?: "owner" | "admin" | "member";
        };
      };
      conversations: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          agent_type: AgentType;
          title: string | null;
          status: "active" | "archived";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          agent_type: AgentType;
          title?: string | null;
          status?: "active" | "archived";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          agent_type?: AgentType;
          title?: string | null;
          status?: "active" | "archived";
          metadata?: Json;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          agent_type: AgentType | null;
          tokens_used: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          agent_type?: AgentType | null;
          tokens_used?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          content?: string;
          metadata?: Json;
        };
      };
      agent_memories: {
        Row: {
          id: string;
          workspace_id: string;
          agent_type: AgentType;
          memory_type: "summary" | "fact" | "preference";
          content: string;
          relevance: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          agent_type: AgentType;
          memory_type: "summary" | "fact" | "preference";
          content: string;
          relevance?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          relevance?: number;
          expires_at?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          platform: "meta" | "google" | "tiktok" | "linkedin" | "email" | null;
          status: "draft" | "active" | "paused" | "finished";
          objective: string | null;
          budget: number | null;
          cac_target: number | null;
          ctr_target: number | null;
          content: Json;
          metrics: Json;
          generated_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          platform?: "meta" | "google" | "tiktok" | "linkedin" | "email" | null;
          status?: "draft" | "active" | "paused" | "finished";
          objective?: string | null;
          budget?: number | null;
          cac_target?: number | null;
          ctr_target?: number | null;
          content?: Json;
          metrics?: Json;
          generated_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          platform?: "meta" | "google" | "tiktok" | "linkedin" | "email" | null;
          status?: "draft" | "active" | "paused" | "finished";
          objective?: string | null;
          budget?: number | null;
          metrics?: Json;
          updated_at?: string;
        };
      };
      contents: {
        Row: {
          id: string;
          workspace_id: string;
          type: "post" | "carousel" | "reel" | "thread" | "email" | "script" | "hook";
          platform: "instagram" | "tiktok" | "youtube" | "linkedin" | "email" | null;
          title: string | null;
          body: string;
          status: "draft" | "approved" | "published";
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          type: "post" | "carousel" | "reel" | "thread" | "email" | "script" | "hook";
          platform?: "instagram" | "tiktok" | "youtube" | "linkedin" | "email" | null;
          title?: string | null;
          body: string;
          status?: "draft" | "approved" | "published";
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          title?: string | null;
          body?: string;
          status?: "draft" | "approved" | "published";
          metadata?: Json;
        };
      };
      leads: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          source: string | null;
          status: "new" | "contacted" | "qualified" | "converted" | "lost";
          score: number;
          notes: string | null;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          status?: "new" | "contacted" | "qualified" | "converted" | "lost";
          score?: number;
          notes?: string | null;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          status?: "new" | "contacted" | "qualified" | "converted" | "lost";
          score?: number;
          notes?: string | null;
          tags?: string[];
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type AgentType = "acquisition" | "content" | "sales";

// Helpers para extrair tipos de linhas das tabelas
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Aliases convenientes
export type Profile = Tables<"profiles">;
export type Workspace = Tables<"workspaces">;
export type WorkspaceMember = Tables<"workspace_members">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
export type AgentMemory = Tables<"agent_memories">;
export type Campaign = Tables<"campaigns">;
export type Content = Tables<"contents">;
export type Lead = Tables<"leads">;
