import { useEffect, useState, useMemo } from 'react';
import {
  History,
  Search,
  Trash2,
  Eye,
  Cloud,
  HardDrive,
  AlertTriangle,
  Loader2,
  Filter,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import type { ScanRecord } from '@/types';
import { getAllScans, deleteScan, clearAllScans, uploadLocalScans } from '@/lib/scanHistory';
import { useApp } from '@/context/AppContext';
import { getLanguage } from '@/lib/languages';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';

export function HistoryPage() {
  const { navigate } = useApp();
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [confirmDelete, setConfirmDelete] = useState<ScanRecord | 'all' | null>(null);
  const [viewing, setViewing] = useState<ScanRecord | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const { records: recs, source: src } = await getAllScans();
    setRecords(recs);
    setSource(src);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (modeFilter !== 'all' && r.ai_mode !== modeFilter) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        r.product_name?.toLowerCase().includes(q) ||
        r.manufacturer?.toLowerCase().includes(q) ||
        r.ai_mode.includes(q)
      );
    });
  }, [records, search, modeFilter]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete === 'all') {
      await clearAllScans();
    } else {
      await deleteScan(confirmDelete.id, source);
    }
    setConfirmDelete(null);
    load();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    const { uploaded } = await uploadLocalScans();
    setSyncing(false);
    setSyncMsg(uploaded > 0 ? `Uploaded ${uploaded} local scan${uploaded > 1 ? 's' : ''} to the cloud.` : 'No new local scans to upload.');
    if (uploaded > 0) load();
  };

  if (viewing) {
    return (
      <AnalysisDashboard
        analysis={viewing.analysis}
        scanDate={viewing.created_at}
        onRescan={() => {
          setViewing(null);
          navigate('scan');
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="section-label"><History className="w-3.5 h-3.5" /> Scan History</span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Your scanned labels</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              source === 'supabase' ? 'bg-med-50 text-med-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {source === 'supabase' ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
            {source === 'supabase' ? 'Cloud synced' : 'Local storage'}
          </span>
        </div>
      </div>

      {/* Sync notice + action */}
      {source === 'local' && records.length > 0 && (
        <div className="glass-card p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              These scans are stored only on this device. Upload them to the cloud to access across devices.
            </span>
          </div>
          <button onClick={handleSync} disabled={syncing} className="btn-secondary text-sm shrink-0">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Upload to cloud
          </button>
        </div>
      )}
      {syncMsg && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-brand-50 text-brand-700 text-sm">
          <CheckCircle2 className="w-4 h-4" /> {syncMsg}
        </div>
      )}

      {/* Controls */}
      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or manufacturer…"
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as typeof modeFilter)}
              className="input-field pl-10 pr-8 appearance-none"
            >
              <option value="all">All modes</option>
              <option value="online">Gemini (online)</option>
              <option value="offline">Ollama (offline)</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState onScan={() => navigate('scan')} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No scans match your filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const lang = getLanguage(r.language);
            return (
              <div
                key={r.id}
                className="glass-card p-4 flex items-center gap-4 hover:shadow-glass-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-med-50 flex items-center justify-center shrink-0">
                  {r.ai_mode === 'online' ? (
                    <Cloud className="w-6 h-6 text-med-600" />
                  ) : (
                    <HardDrive className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {r.product_name ?? 'Unidentified label'}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {r.manufacturer ?? 'Manufacturer not found'} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {r.ai_mode === 'online' ? 'Gemini' : 'Ollama'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {lang.flag} {lang.nativeName}
                    </span>
                    <span className="text-xs text-slate-400">{r.image_count} image{r.image_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewing(r)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    title="View report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(r)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {records.length > 0 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setConfirmDelete('all')}
                className="btn-ghost text-sm text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" /> Clear all history
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete === 'all' ? 'Clear all scan history?' : 'Delete this scan?'}
          message={
            confirmDelete === 'all'
              ? 'This will permanently remove all stored scans. This cannot be undone.'
              : 'This will permanently remove this scan record.'
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function EmptyState({ onScan }: { onScan: () => void }) {
  return (
    <div className="glass-card p-10 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <History className="w-8 h-8 text-brand-600" />
      </div>
      <h3 className="font-semibold text-slate-800">No scans yet</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
        Your scanned labels will appear here with full reports you can revisit anytime.
      </p>
      <button onClick={onScan} className="mt-5 btn-primary">
        Scan your first label
      </button>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-card-strong p-6 max-w-sm w-full animate-scale-in">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button onClick={onCancel} className="btn-secondary text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-primary text-sm bg-rose-600 hover:bg-rose-700">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}


