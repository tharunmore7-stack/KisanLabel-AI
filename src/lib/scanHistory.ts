import type { ScanRecord, LabelAnalysis, AiMode, LanguageCode } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { getLocalScans, saveLocalScan, deleteLocalScan, clearLocalScans } from './localDb';

export interface NewScan {
  analysis: LabelAnalysis;
  aiMode: AiMode;
  language: LanguageCode;
  imageCount: number;
}

function toRecord(id: string, scan: NewScan, createdAt: string): ScanRecord {
  return {
    id,
    product_name: scan.analysis.productIdentification.productName ?? null,
    manufacturer: scan.analysis.productIdentification.manufacturer ?? null,
    ai_mode: scan.aiMode,
    language: scan.language,
    analysis: scan.analysis,
    image_count: scan.imageCount,
    created_at: createdAt,
  };
}

export async function saveScan(scan: NewScan): Promise<ScanRecord> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const record = toRecord(id, scan, createdAt);

  // Always store locally (offline-first)
  await saveLocalScan(record);

  // Also push to Supabase when online + configured
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('scans').insert({
        id,
        product_name: record.product_name,
        manufacturer: record.manufacturer,
        ai_mode: record.ai_mode,
        language: record.language,
        analysis: record.analysis,
        image_count: record.image_count,
        created_at: record.created_at,
      });
    } catch {
      // local copy is still saved; sync can retry later
    }
  }

  return record;
}

export async function getAllScans(): Promise<{
  records: ScanRecord[];
  source: 'supabase' | 'local';
}> {
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return { records: data as ScanRecord[], source: 'supabase' };
      }
    } catch {
      /* fall back to local */
    }
  }
  const records = await getLocalScans();
  return { records, source: 'local' };
}

export async function deleteScan(id: string, source: 'supabase' | 'local'): Promise<void> {
  await deleteLocalScan(id);
  if (source === 'supabase' && isSupabaseConfigured && supabase) {
    try {
      await supabase.from('scans').delete().eq('id', id);
    } catch {
      /* ignore */
    }
  }
}

export async function clearAllScans(): Promise<void> {
  await clearLocalScans();
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      /* ignore */
    }
  }
}

export async function uploadLocalScans(): Promise<{ uploaded: number }> {
  const local = await getLocalScans();
  if (local.length === 0 || !isSupabaseConfigured || !supabase) return { uploaded: 0 };

  let uploaded = 0;
  for (const rec of local) {
    try {
      const { data } = await supabase.from('scans').select('id').eq('id', rec.id).maybeSingle();
      if (!data) {
        await supabase.from('scans').insert({
          id: rec.id,
          product_name: rec.product_name,
          manufacturer: rec.manufacturer,
          ai_mode: rec.ai_mode,
          language: rec.language,
          analysis: rec.analysis,
          image_count: rec.image_count,
          created_at: rec.created_at,
        });
        uploaded += 1;
      }
    } catch {
      /* skip on error */
    }
  }
  return { uploaded };
}
