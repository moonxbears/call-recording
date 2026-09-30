import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Languages, FileOutput, Bell, Save, Check } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import SettingSection from "@/components/settings/SettingSection";
import ToggleRow from "@/components/settings/ToggleRow";
import SelectRow from "@/components/settings/SelectRow";
import SliderRow from "@/components/settings/SliderRow";

const DEFAULTS = {
  auto_record_incoming: true,
  auto_record_outgoing: true,
  record_when_roaming: false,
  min_duration_sec: 3,
  retention_days: 90,
  encrypt_recordings: true,
  auto_transcribe: true,
  transcription_language: "en-US",
  speaker_diarization: true,
  profanity_filter: false,
  transcription_model: "balanced",
  audio_format: "mp3",
  audio_quality: "high",
  transcript_format: "txt",
  include_timestamps: true,
  auto_export_cloud: true,
  notify_new_recording: true,
  notify_transcription_ready: true,
  email_summary: "weekly",
};

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "pt-BR", label: "Portuguese (BR)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "zh-CN", label: "Chinese (Mandarin)" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ar-SA", label: "Arabic" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [settings, setSettings] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSettings({ ...DEFAULTS, ...data });
          setRecordId(data.id);
        }
      } catch (e) {
        console.error("Failed to load settings from Supabase", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const update = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = { ...settings, user_id: user.id, updated_at: new Date().toISOString() };
      delete payload.id;
      delete payload.created_at;

      const { data, error } = await supabase
        .from("settings")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      if (data) setRecordId(data.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save settings to Supabase", e);
    } finally {
      setSaving(false);
    }
  }, [settings, user]);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#1E293B] bg-[#090D16]/95 backdrop-blur px-5 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E293B] text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Recording Settings</h1>
            <p className="text-xs text-slate-500">Configure capture, transcription, and output behavior</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-amber-500 text-[#090D16] text-sm font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-5 py-6 space-y-5">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Call Recording */}
            <SettingSection
              icon={Mic}
              title="Call Recording"
              description="Control which calls are captured and how long they're kept"
            >
              <ToggleRow
                label="Auto-record incoming calls"
                description="Capture every inbound call automatically"
                checked={settings.auto_record_incoming}
                onChange={(v) => update("auto_record_incoming", v)}
              />
              <ToggleRow
                label="Auto-record outgoing calls"
                description="Capture every outbound call automatically"
                checked={settings.auto_record_outgoing}
                onChange={(v) => update("auto_record_outgoing", v)}
              />
              <ToggleRow
                label="Record while roaming"
                description="Continue capturing on foreign networks (may incur data charges)"
                checked={settings.record_when_roaming}
                onChange={(v) => update("record_when_roaming", v)}
              />
              <SliderRow
                label="Minimum call duration"
                description="Discard calls shorter than this threshold"
                value={settings.min_duration_sec}
                min={0}
                max={30}
                step={1}
                unit="s"
                onChange={(v) => update("min_duration_sec", v)}
              />
              <SelectRow
                label="Retention period"
                description="Recordings are auto-deleted after this window"
                value={settings.retention_days}
                options={[
                  { value: 7, label: "7 days" },
                  { value: 30, label: "30 days" },
                  { value: 90, label: "90 days" },
                  { value: 365, label: "1 year" },
                  { value: 3650, label: "Indefinite" },
                ]}
                onChange={(v) => update("retention_days", Number(v))}
              />
              <ToggleRow
                label="Encrypt recordings at rest"
                description="Apply AES-256 encryption to stored audio"
                checked={settings.encrypt_recordings}
                onChange={(v) => update("encrypt_recordings", v)}
              />
            </SettingSection>

            {/* Transcription */}
            <SettingSection
              icon={Languages}
              title="Transcription"
              description="How speech is converted to searchable text"
            >
              <ToggleRow
                label="Auto-transcribe new recordings"
                description="Queue a transcript as soon as a call ends"
                checked={settings.auto_transcribe}
                onChange={(v) => update("auto_transcribe", v)}
              />
              <SelectRow
                label="Transcription language"
                description="Primary language used for recognition"
                value={settings.transcription_language}
                options={LANGUAGES}
                onChange={(v) => update("transcription_language", v)}
              />
              <ToggleRow
                label="Speaker diarization"
                description="Separate and label each speaker in the transcript"
                checked={settings.speaker_diarization}
                onChange={(v) => update("speaker_diarization", v)}
              />
              <SelectRow
                label="Transcription model"
                description="Tradeoff between speed and accuracy"
                value={settings.transcription_model}
                options={[
                  { value: "fast", label: "Fast (real-time)" },
                  { value: "balanced", label: "Balanced" },
                  { value: "accurate", label: "Accurate (deep)" },
                ]}
                onChange={(v) => update("transcription_model", v)}
              />
              <ToggleRow
                label="Profanity filter"
                description="Mask offensive language in transcript output"
                checked={settings.profanity_filter}
                onChange={(v) => update("profanity_filter", v)}
              />
            </SettingSection>

            {/* Output */}
            <SettingSection
              icon={FileOutput}
              title="Output"
              description="Format and quality of exported audio and transcripts"
            >
              <SelectRow
                label="Audio format"
                description="Container and codec for exported recordings"
                value={settings.audio_format}
                options={[
                  { value: "mp3", label: "MP3" },
                  { value: "wav", label: "WAV (uncompressed)" },
                  { value: "aac", label: "AAC" },
                  { value: "opus", label: "Opus" },
                ]}
                onChange={(v) => update("audio_format", v)}
              />
              <SelectRow
                label="Audio quality"
                description="Bitrate and fidelity of exports"
                value={settings.audio_quality}
                options={[
                  { value: "standard", label: "Standard (64 kbps)" },
                  { value: "high", label: "High (128 kbps)" },
                  { value: "lossless", label: "Lossless" },
                ]}
                onChange={(v) => update("audio_quality", v)}
              />
              <SelectRow
                label="Transcript format"
                description="Default file format for transcript exports"
                value={settings.transcript_format}
                options={[
                  { value: "txt", label: "Plain text (.txt)" },
                  { value: "srt", label: "SubRip (.srt)" },
                  { value: "vtt", label: "WebVTT (.vtt)" },
                  { value: "json", label: "JSON (.json)" },
                ]}
                onChange={(v) => update("transcript_format", v)}
              />
              <ToggleRow
                label="Include timestamps"
                description="Embed timecodes in exported transcripts"
                checked={settings.include_timestamps}
                onChange={(v) => update("include_timestamps", v)}
              />
              <ToggleRow
                label="Auto-export to cloud"
                description="Mirror exports to connected cloud storage"
                checked={settings.auto_export_cloud}
                onChange={(v) => update("auto_export_cloud", v)}
              />
            </SettingSection>

            {/* Notifications */}
            <SettingSection
              icon={Bell}
              title="Notifications"
              description="When and how you're alerted about activity"
            >
              <ToggleRow
                label="New recording alerts"
                description="Notify when a call is captured"
                checked={settings.notify_new_recording}
                onChange={(v) => update("notify_new_recording", v)}
              />
              <ToggleRow
                label="Transcription ready alerts"
                description="Notify when a transcript finishes processing"
                checked={settings.notify_transcription_ready}
                onChange={(v) => update("notify_transcription_ready", v)}
              />
              <SelectRow
                label="Activity summary email"
                description="Digest of recording activity sent to your inbox"
                value={settings.email_summary}
                options={[
                  { value: "never", label: "Never" },
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ]}
                onChange={(v) => update("email_summary", v)}
              />
            </SettingSection>
          </>
        )}
      </div>
    </div>
  );
}