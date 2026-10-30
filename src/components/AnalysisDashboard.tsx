import {
  Package,
  Sprout,
  Beaker,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Droplets,
  Recycle,
  Eye,
  Hand,
  Activity,
  FileText,
  RotateCcw,
  MessageSquare,
  Download,
  Sparkles,
  Info,
  CircleAlert,
} from 'lucide-react';
import type { LabelAnalysis, WarningCard } from '@/types';
import { useApp } from '@/context/AppContext';
import { getLanguage } from '@/lib/languages';
import { AiModeBadge } from '@/components/StatusBadges';

interface Props {
  onRescan?: () => void;
  analysis?: LabelAnalysis;
  scanDate?: string;
}

const CONFIDENCE_META: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'High confidence', color: 'text-brand-700', bg: 'bg-brand-50' },
  medium: { label: 'Medium confidence', color: 'text-amber-700', bg: 'bg-amber-50' },
  low: { label: 'Low confidence', color: 'text-orange-700', bg: 'bg-orange-50' },
  missing: { label: 'Information missing', color: 'text-rose-700', bg: 'bg-rose-50' },
};

const WARNING_META: Record<WarningCard['type'], { icon: typeof AlertTriangle; color: string; bg: string }> = {
  toxicity: { icon: FlaskConical, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  'skin-eye': { icon: Eye, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  environmental: { icon: Droplets, color: 'text-med-600', bg: 'bg-med-50 border-med-200' },
  restricted: { icon: Hand, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  'missing-info': { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

export function AnalysisDashboard({ onRescan, analysis, scanDate }: Props) {
  const { lastAnalysis, lastScan, navigate, language, aiMode } = useApp();
  const data = analysis ?? lastAnalysis;
  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">No analysis available yet. Scan a label to see results here.</p>
        <button onClick={() => navigate('scan')} className="mt-6 btn-primary">
          <Sparkles className="w-4 h-4" /> Scan a Label
        </button>
      </div>
    );
  }

  const conf = CONFIDENCE_META[data.overallConfidence] ?? CONFIDENCE_META.missing;
  const lang = getLanguage(language);
  const dateStr = scanDate ?? lastScan?.created_at ?? new Date().toISOString();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card-strong p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="section-label"><FileText className="w-3.5 h-3.5" /> Analysis Report</span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
              {data.productIdentification.productName || 'Pesticide Label Analysis'}
            </h1>
            {data.productIdentification.manufacturer && (
              <p className="mt-1 text-slate-500">{data.productIdentification.manufacturer}</p>
            )}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${conf.bg} ${conf.color}`}>
                <CircleAlert className="w-3.5 h-3.5" /> {conf.label}
              </span>
              <AiModeBadge />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium">
                {lang.flag} {lang.nativeName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('assistant')} className="btn-secondary text-sm">
              <MessageSquare className="w-4 h-4" /> Ask AI
            </button>
            <button onClick={() => downloadReport(data, dateStr, aiMode)} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            {onRescan && (
              <button onClick={onRescan} className="btn-primary text-sm">
                <RotateCcw className="w-4 h-4" /> Scan Again
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* A. Product Identification */}
        <SectionCard icon={Package} title="Product Identification" accent="brand">
          <Field label="Product name" value={data.productIdentification.productName} />
          <Field label="Manufacturer" value={data.productIdentification.manufacturer} />
          <Field label="Active ingredient" value={data.productIdentification.activeIngredient} />
          <Field label="Chemical composition" value={data.productIdentification.chemicalComposition} />
          <Field label="Formulation type" value={data.productIdentification.formulationType} />
          <Field label="Registration number" value={data.productIdentification.registrationNumber} />
        </SectionCard>

        {/* B. Crop & Pest */}
        <SectionCard icon={Sprout} title="Crop & Pest Information" accent="med">
          <ListField label="Crops on label" items={data.cropPestInfo.crops} />
          <ListField label="Target pests" items={data.cropPestInfo.pests} />
          <Field label="Approved usage" value={data.cropPestInfo.approvedUsage} />
          <Field label="Application method" value={data.cropPestInfo.applicationMethod} />
        </SectionCard>

        {/* C. Dosage */}
        <SectionCard icon={Beaker} title="Dosage & Tank Information" accent="brand">
          <Field label="Dosage instructions" value={data.dosage.dosageInstructions} />
          <Field label="Dosage units" value={data.dosage.dosageUnits} />
          <Field
            label="Tank capacity"
            value={data.dosage.tankCapacity}
            placeholder={
              data.dosage.tankCapacityMentioned ? undefined : 'Not explicitly mentioned on label'
            }
          />
          {data.dosage.explanation && (
            <Note label="What this means" value={data.dosage.explanation} kind="ai" />
          )}
          {data.dosage.unclearOrMissing && (
            <InlineWarn text="Dosage information is unclear or missing. Re-scan with a clearer photo or consult the official label." />
          )}
        </SectionCard>

        {/* D. Waiting Period */}
        <SectionCard icon={Clock} title="Waiting Period" accent="med">
          <Field label="Pre-harvest interval" value={data.waitingPeriod.preHarvestInterval} />
          <Field label="Waiting period before harvest" value={data.waitingPeriod.waitingPeriod} />
          <Field label="Re-entry interval" value={data.waitingPeriod.reEntryInterval} />
          {data.waitingPeriod.explanation && (
            <Note label="In simple language" value={data.waitingPeriod.explanation} kind="ai" />
          )}
          {!data.waitingPeriod.preHarvestInterval &&
            !data.waitingPeriod.waitingPeriod &&
            !data.waitingPeriod.reEntryInterval && (
              <InlineWarn text="No waiting period was found on the label. Contact the manufacturer or an agricultural expert." />
            )}
        </SectionCard>

        {/* E. Safety Instructions */}
        <SectionCard icon={ShieldCheck} title="Safety Instructions" accent="brand" wide>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            <ListField icon={Eye} label="Protective equipment" items={data.safetyInstructions.protectiveEquipment} />
            <ListField icon={Hand} label="Handling precautions" items={data.safetyInstructions.handlingPrecautions} />
            <ListField icon={Beaker} label="Storage instructions" items={data.safetyInstructions.storageInstructions} />
            <ListField icon={Droplets} label="Environmental precautions" items={data.safetyInstructions.environmentalPrecautions} />
            <ListField icon={Recycle} label="Disposal instructions" items={data.safetyInstructions.disposalInstructions} />
            <ListField icon={Activity} label="First-aid instructions" items={data.safetyInstructions.firstAid} />
          </div>
        </SectionCard>

        {/* F. Warnings */}
        <SectionCard icon={AlertTriangle} title="Important Warnings" accent="amber" wide>
          {data.warnings.length === 0 && data.missingFields.length === 0 ? (
            <p className="text-sm text-slate-500">No specific warnings were identified on this label.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.warnings.map((w, i) => {
                const meta = WARNING_META[w.type];
                const Icon = meta.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${meta.bg}`}>
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.color}`} />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{w.title}</p>
                      <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">{w.details}</p>
                    </div>
                  </div>
                );
              })}
              {data.missingFields.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Missing label information</p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      The following could not be read from the label: {data.missingFields.join(', ')}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Source distinction legend */}
      <div className="mt-6 flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-50 text-xs text-slate-500">
        <span className="font-semibold text-slate-600">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Extracted from label
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-med-500" /> AI-generated explanation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Missing / unclear
        </span>
        <span className="ml-auto text-slate-400">
          Always follow the official product label and consult a qualified expert.
        </span>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  accent,
  wide,
  children,
}: {
  icon: typeof Package;
  title: string;
  accent: 'brand' | 'med' | 'amber';
  wide?: boolean;
  children: React.ReactNode;
}) {
  const accentMap = {
    brand: 'from-brand-50 to-white text-brand-600',
    med: 'from-med-50 to-white text-med-600',
    amber: 'from-amber-50 to-white text-amber-600',
  };
  return (
    <div className={`glass-card p-6 ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string;
  placeholder?: string;
}) {
  if (!value) {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm text-amber-600 italic">{placeholder ?? 'Not found on label'}</span>
      </div>
    );
  }
  return (
    <div className="py-1.5 border-b border-slate-100 last:border-0">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value}</p>
    </div>
  );
}

function ListField({
  label,
  items,
  icon: Icon,
}: {
  label: string;
  items: string[];
  icon?: typeof Eye;
}) {
  return (
    <div className="py-1.5 border-b border-slate-100 last:border-0">
      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-amber-600 italic">Not found on label</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-medium"
            >
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Note({
  label,
  value,
  kind,
}: {
  label: string;
  value: string;
  kind: 'ai' | 'extracted';
}) {
  return (
    <div className="mt-2 p-3 rounded-lg bg-med-50/60 border border-med-100">
      <p className="text-xs font-semibold text-med-700 mb-1 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> {label}
        {kind === 'ai' && <span className="text-med-400 font-normal">(AI explanation)</span>}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

function InlineWarn({ text }: { text: string }) {
  return (
    <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {text}
    </div>
  );
}

function downloadReport(data: LabelAnalysis, dateStr: string, mode: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const name = (data.productIdentification.productName ?? 'label').replace(/\s+/g, '_').toLowerCase();
  a.download = `kisanlabel_${name}_${dateStr.slice(0, 10)}_${mode}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
