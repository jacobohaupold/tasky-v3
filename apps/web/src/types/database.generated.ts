export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_addr: unknown
          new_data: Json | null
          old_data: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_addr?: unknown
          new_data?: Json | null
          old_data?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_addr?: unknown
          new_data?: Json | null
          old_data?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          created_at: string
          created_by: string
          id: string
          node_id: string
          parent_block_id: string | null
          position: number
          props: Json
          schema_version: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          node_id: string
          parent_block_id?: string | null
          position?: number
          props?: Json
          schema_version?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          node_id?: string
          parent_block_id?: string | null
          position?: number
          props?: Json
          schema_version?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_parent_block_id_fkey"
            columns: ["parent_block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          end_at: string | null
          id: string
          is_all_day: boolean
          location: string | null
          node_id: string | null
          parent_event_id: string | null
          recurrence_exceptions: string[]
          recurrence_rule: string | null
          start_at: string
          title: string
          updated_at: string
          url: string | null
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_at?: string | null
          id?: string
          is_all_day?: boolean
          location?: string | null
          node_id?: string | null
          parent_event_id?: string | null
          recurrence_exceptions?: string[]
          recurrence_rule?: string | null
          start_at: string
          title: string
          updated_at?: string
          url?: string | null
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_at?: string | null
          id?: string
          is_all_day?: boolean
          location?: string | null
          node_id?: string | null
          parent_event_id?: string | null
          recurrence_exceptions?: string[]
          recurrence_rule?: string | null
          start_at?: string
          title?: string
          updated_at?: string
          url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_item_values: {
        Row: {
          item_id: string
          property_id: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          item_id: string
          property_id: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          item_id?: string
          property_id?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_item_values_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "collection_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_item_values_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collection_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          archived_at: string | null
          collection_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          node_id: string
          position: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          collection_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          node_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          collection_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          node_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_properties: {
        Row: {
          collection_id: string
          config: Json
          created_at: string
          id: string
          is_computed: boolean
          is_hidden: boolean
          is_required: boolean
          key: string
          name: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          collection_id: string
          config?: Json
          created_at?: string
          id?: string
          is_computed?: boolean
          is_hidden?: boolean
          is_required?: boolean
          key: string
          name: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          collection_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_computed?: boolean
          is_hidden?: boolean
          is_required?: boolean
          key?: string
          name?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_properties_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_relations: {
        Row: {
          from_property_id: string
          id: string
          is_two_way: boolean
          to_collection_id: string
          to_property_id: string | null
        }
        Insert: {
          from_property_id: string
          id?: string
          is_two_way?: boolean
          to_collection_id: string
          to_property_id?: string | null
        }
        Update: {
          from_property_id?: string
          id?: string
          is_two_way?: boolean
          to_collection_id?: string
          to_property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_relations_from_property_id_fkey"
            columns: ["from_property_id"]
            isOneToOne: false
            referencedRelation: "collection_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_relations_to_collection_id_fkey"
            columns: ["to_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_relations_to_property_id_fkey"
            columns: ["to_property_id"]
            isOneToOne: false
            referencedRelation: "collection_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_views: {
        Row: {
          collection_id: string
          config: Json
          created_at: string
          created_by: string
          id: string
          is_default: boolean
          name: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          collection_id: string
          config?: Json
          created_at?: string
          created_by: string
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          collection_id?: string
          config?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_views_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_views_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          name: string | null
          node_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string | null
          node_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string | null
          node_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      node_permissions: {
        Row: {
          access: string
          created_at: string
          created_by: string | null
          id: string
          inherited: boolean
          node_id: string
          subject_id: string | null
          subject_type: string
        }
        Insert: {
          access: string
          created_at?: string
          created_by?: string | null
          id?: string
          inherited?: boolean
          node_id: string
          subject_id?: string | null
          subject_type: string
        }
        Update: {
          access?: string
          created_at?: string
          created_by?: string | null
          id?: string
          inherited?: boolean
          node_id?: string
          subject_id?: string | null
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "node_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_permissions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          archived_at: string | null
          cover_url: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          icon: string | null
          id: string
          is_favorite: boolean
          is_locked: boolean
          parent_id: string | null
          position: number
          title: string
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          cover_url?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          icon?: string | null
          id?: string
          is_favorite?: boolean
          is_locked?: boolean
          parent_id?: string | null
          position?: number
          title?: string
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          icon?: string | null
          id?: string
          is_favorite?: boolean
          is_locked?: boolean
          parent_id?: string | null
          position?: number
          title?: string
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          prefs: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          prefs?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          prefs?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_format: string
          display_name: string | null
          email: string
          id: string
          locale: string
          role: string
          status: string
          theme: string
          time_format: string
          timezone: string
          units: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_format?: string
          display_name?: string | null
          email: string
          id: string
          locale?: string
          role?: string
          status?: string
          theme?: string
          time_format?: string
          timezone?: string
          units?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_format?: string
          display_name?: string | null
          email?: string
          id?: string
          locale?: string
          role?: string
          status?: string
          theme?: string
          time_format?: string
          timezone?: string
          units?: string
          updated_at?: string
        }
        Relationships: []
      }
      recent_views: {
        Row: {
          node_id: string
          user_id: string
          viewed_at: string
          workspace_id: string
        }
        Insert: {
          node_id: string
          user_id: string
          viewed_at?: string
          workspace_id: string
        }
        Update: {
          node_id?: string
          user_id?: string
          viewed_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_views_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_views_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_addr: unknown
          metadata: Json
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_addr?: unknown
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_addr?: unknown
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sidebar_state: {
        Row: {
          active_node_id: string | null
          expanded_node_ids: string[]
          scroll_position: number
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          active_node_id?: string | null
          expanded_node_ids?: string[]
          scroll_position?: number
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          active_node_id?: string | null
          expanded_node_ids?: string[]
          scroll_position?: number
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sidebar_state_active_node_id_fkey"
            columns: ["active_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sidebar_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sidebar_state_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      template_assets: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          storage_path: string
          type: string
          version_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          storage_path: string
          type: string
          version_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string
          type?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_assets_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      template_installations: {
        Row: {
          error_message: string | null
          id: string
          id_map: Json | null
          installed_at: string
          root_node_id: string | null
          status: string
          template_version_id: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          id_map?: Json | null
          installed_at?: string
          root_node_id?: string | null
          status?: string
          template_version_id: string
          user_id: string
          workspace_id: string
        }
        Update: {
          error_message?: string | null
          id?: string
          id_map?: Json | null
          installed_at?: string
          root_node_id?: string | null
          status?: string
          template_version_id?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_installations_root_node_id_fkey"
            columns: ["root_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_installations_template_version_id_fkey"
            columns: ["template_version_id"]
            isOneToOne: false
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_installations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_installations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      template_products: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          name: string
          slug: string
          tags: string[]
          theme: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name: string
          slug: string
          tags?: string[]
          theme?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name?: string
          slug?: string
          tags?: string[]
          theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_stats: {
        Row: {
          install_count: number
          last_30d_installs: number
          rating_avg: number | null
          updated_at: string
          version_id: string
        }
        Insert: {
          install_count?: number
          last_30d_installs?: number
          rating_avg?: number | null
          updated_at?: string
          version_id: string
        }
        Update: {
          install_count?: number
          last_30d_installs?: number
          rating_avg?: number | null
          updated_at?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_stats_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: true
            referencedRelation: "template_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      template_versions: {
        Row: {
          changelog: string | null
          created_at: string
          id: string
          is_latest: boolean
          manifest: Json
          product_id: string
          version: string
        }
        Insert: {
          changelog?: string | null
          created_at?: string
          id?: string
          is_latest?: boolean
          manifest: Json
          product_id: string
          version: string
        }
        Update: {
          changelog?: string | null
          created_at?: string
          id?: string
          is_latest?: boolean
          manifest?: Json
          product_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "template_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          node_id: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          node_id: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          node_id?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          settings: Json
          updated_at: string
          workspace_id: string
        }
        Insert: {
          settings?: Json
          updated_at?: string
          workspace_id: string
        }
        Update: {
          settings?: Json
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          cover_url: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          owner_id: string
          plan: string
          settings: Json
          slug: string | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string
          settings?: Json
          slug?: string | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string
          settings?: Json
          slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_node_position: {
        Args: { next_pos?: number; prev_pos?: number }
        Returns: number
      }
      increment_template_install_count: {
        Args: { p_version_id: string }
        Returns: undefined
      }
      is_workspace_admin: {
        Args: { p_user_id?: string; p_workspace_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { p_user_id?: string; p_workspace_id: string }
        Returns: boolean
      }
      reorder_collection_items: {
        Args: { p_collection_id: string; p_item_ids: string[] }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

