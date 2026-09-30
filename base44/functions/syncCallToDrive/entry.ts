import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

function formatTime(sec) {
  if (sec == null || isNaN(sec)) return "00:00:00";
  const s = Math.floor(sec);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function buildTranscriptText(call) {
  const lines = [];
  lines.push(`Call: ${call.title || call.contact_name || call.phone_number || "Unknown"}`);
  if (call.intercepted_at) lines.push(`Date: ${call.intercepted_at}`);
  if (call.duration_sec != null) lines.push(`Duration: ${call.duration_sec}s`);
  if (call.direction) lines.push(`Direction: ${call.direction}`);
  lines.push("");
  const transcript = call.transcript || [];
  if (transcript.length === 0) {
    lines.push("(No transcript available)");
  } else {
    for (const seg of transcript) {
      const ts = formatTime(seg.start);
      const speaker = seg.speaker || "Speaker";
      lines.push(`[${ts}] ${speaker}: ${seg.text || ""}`);
    }
  }
  return lines.join("\n");
}

function sanitizeFilename(name) {
  return (name || "call").replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "_") || "call";
}

function audioMimeFromUrl(url) {
  const ext = (url.split("?")[0].split(".").pop() || "").toLowerCase();
  const map = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    opus: "audio/opus",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm",
  };
  return map[ext] || "application/octet-stream";
}

async function uploadToDrive(accessToken, fileName, mimeType, contentBytes) {
  const boundary = "base44_" + Math.random().toString(36).slice(2);
  const metadata = JSON.stringify({ name: fileName, mimeType });
  const headerText =
    `\r\n--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`;
  const footerText = `\r\n--${boundary}--\r\n`;
  const body = new Blob([headerText, contentBytes, footerText], {
    type: `multipart/related; boundary=${boundary}`,
  });
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body,
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive upload failed (${res.status}) for ${fileName}: ${errText}`);
  }
  return await res.json();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Entity automation passes { event, data, old_data }; manual invoke passes { call_id }
    let call = null;
    if (body.data && body.data.id) {
      call = body.data;
    } else if (body.call_id) {
      call = await base44.asServiceRole.entities.Call.get(body.call_id);
    }

    if (!call) {
      return Response.json({ status: "ignored", reason: "no call data" });
    }

    // Only sync ready calls with a transcript that haven't been backed up yet
    if (call.status !== "ready") {
      return Response.json({ status: "ignored", reason: "call not ready" });
    }
    if (!Array.isArray(call.transcript) || call.transcript.length === 0) {
      return Response.json({ status: "ignored", reason: "no transcript" });
    }
    if (call.drive_synced) {
      return Response.json({ status: "ignored", reason: "already synced to drive" });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googledrive");
    const baseName = sanitizeFilename(call.title || call.contact_name || call.phone_number || "call");
    const results = {};

    // Upload the transcript as a text file
    const transcriptText = buildTranscriptText(call);
    const transcriptBytes = new TextEncoder().encode(transcriptText);
    results.transcript = await uploadToDrive(
      accessToken,
      `${baseName}_transcript.txt`,
      "text/plain",
      transcriptBytes
    );

    // Upload the audio recording if a URL is available
    if (call.recording_url) {
      const audioRes = await fetch(call.recording_url);
      if (audioRes.ok) {
        const audioBytes = new Uint8Array(await audioRes.arrayBuffer());
        const mime = audioMimeFromUrl(call.recording_url);
        const ext = (call.recording_url.split("?")[0].split(".").pop() || "audio").toLowerCase();
        results.audio = await uploadToDrive(accessToken, `${baseName}.${ext}`, mime, audioBytes);
      } else {
        results.audio_error = `audio fetch failed (${audioRes.status})`;
      }
    }

    // Mark the call as synced so we don't re-upload on later updates
    await base44.asServiceRole.entities.Call.update(call.id, { drive_synced: true });

    return Response.json({ status: "synced", call_id: call.id, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}