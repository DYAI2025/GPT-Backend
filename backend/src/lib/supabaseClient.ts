import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Database Types
export interface UserMemory {
    id: string;
    user_id: string;
    key: string;
    value: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface Template {
    id: string;
    name: string;
    type: string;
    description?: string;
    metadata?: Record<string, unknown>;
    body: string;
    created_at: string;
    updated_at: string;
}

// Supabase Client Singleton
class SupabaseWrapper {
    private client: SupabaseClient | null = null;

    getClient(): SupabaseClient {
        if (!this.client) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase environment variables');
            }

            this.client = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            });
        }
        return this.client;
    }

    // Health check for database
    async checkHealth(): Promise<boolean> {
        try {
            const { error } = await this.getClient()
                .from('user_memory')
                .select('id')
                .limit(1);
            return !error;
        } catch {
            return false;
        }
    }

    // Memory Operations
    async upsertMemory(
        userId: string,
        key: string,
        value: Record<string, unknown>
    ): Promise<{ updated: boolean }> {
        const client = this.getClient();

        // Check if entry exists
        const { data: existing } = await client
            .from('user_memory')
            .select('id')
            .eq('user_id', userId)
            .eq('key', key)
            .single();

        const isUpdate = !!existing;

        const { error } = await client
            .from('user_memory')
            .upsert(
                {
                    user_id: userId,
                    key,
                    value,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,key' }
            );

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        return { updated: isUpdate };
    }

    async queryMemory(
        userId: string,
        key: string
    ): Promise<Record<string, unknown> | null> {
        const { data, error } = await this.getClient()
            .from('user_memory')
            .select('value')
            .eq('user_id', userId)
            .eq('key', key)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Database error: ${error.message}`);
        }

        return data?.value as Record<string, unknown>;
    }
}

export const supabase = new SupabaseWrapper();
