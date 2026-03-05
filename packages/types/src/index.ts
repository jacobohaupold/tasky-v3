// ── Core Domain Types for Tasky ──

export type UUID = string;
export type ISO8601 = string;

// ── User ──
export interface User {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: ISO8601;
  updated_at: ISO8601;
}

// ── Priority ──
export type Priority = "urgent" | "high" | "medium" | "low" | "none";

// ── Task Status ──
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "cancelled";

// ── Task ──
export interface Task {
  id: UUID;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: ISO8601 | null;
  assignee_id: UUID | null;
  project_id: UUID | null;
  created_by: UUID;
  created_at: ISO8601;
  updated_at: ISO8601;
}

// ── Project ──
export interface Project {
  id: UUID;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  owner_id: UUID;
  created_at: ISO8601;
  updated_at: ISO8601;
}

// ── Label ──
export interface Label {
  id: UUID;
  name: string;
  color: string;
  project_id: UUID;
}

// ── Comment ──
export interface Comment {
  id: UUID;
  content: string;
  task_id: UUID;
  author_id: UUID;
  created_at: ISO8601;
  updated_at: ISO8601;
}

// ── Workspace Member ──
export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMember {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  role: WorkspaceMemberRole;
  joined_at: ISO8601;
}

// ── API Response Wrappers ──
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
