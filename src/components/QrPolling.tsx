import { useEffect, useRef, useState } from "react";

type RawResp = any;
type Sessao = { status: string; qr?: string | null; pairingCode?: string | null; error?: string };

function normalizeResp(resp: RawResp): Sessao {
  const j = Array.isArray(resp) ? (resp[0] ?? {}) : (resp ?? {});
  
  // status base
  let status =
    (j.status as string) ||
    (j.state as string) ||
    (j.pairingCode || j.code ? "PAIRING" : null) ||
    "UNKNOWN";
  status = String(status).toUpperCase();

  // localizar QR - buscar em diferentes campos
  let qr: string | null =
    (j.qr as string) ??
    (j.base64 as string) ??
    (j.image as string) ??
    null;

  // Se o base64 já vem completo, não remover o prefixo
  // Se não tem prefixo, adicionar depois
  if (typeof qr === "string") {
    // Se já tem o prefixo data:image, usar como está
    if (qr.startsWith("data:image")) {
      // Não fazer nada, já está no formato correto
    } else {
      // Se não tem prefixo, assumir que é base64 puro
      // Será adicionado o prefixo na renderização
    }
  }

  const pairingCode: string | null = (j.pairingCode as string) ?? (j.code as string) ?? null;

  return { status, qr, pairingCode };
}

export default function QrPolling({
  instance,
  endpoint,
  intervalMs = 2000,
  initialQr
}: {
  instance: string;
  endpoint: string; // ex.: "https://SEU_N8N/webhook/qr-status" ou "/api/whats/status"
  intervalMs?: number;
  initialQr?: string;
}) {
  const [status, setStatus] = useState<string>("LOADING");
  const [qr, setQr] = useState<string | null>(initialQr || null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  const lastQrRef = useRef<string | null>(initialQr || null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isPollingRef = useRef<boolean>(false);

  // Se temos um QR inicial, definir status como QRCODE
  useEffect(() => {
    if (initialQr) {
      setStatus("QRCODE");
      lastQrRef.current = initialQr;
      setQr(initialQr);
    }
  }, [initialQr]);

  const fetchStatus = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const url = `${endpoint}?instance=${encodeURIComponent(instance)}&t=${Date.now()}`;
      const r = await fetch(url, { signal: ac.signal, headers: { "cache-control": "no-cache" } });
      const raw = await r.json();
      const data = normalizeResp(raw);

      setStatus(data.status);
      setPairingCode(data.pairingCode ?? null);

      if (data.qr) {
        lastQrRef.current = data.qr;
        setQr(data.qr);
      } else if (["QRCODE", "UNPAIRED", "PAIRING", "CONNECTING"].includes(data.status.toUpperCase())) {
        // Manter o último QR válido enquanto está conectando
        setQr(lastQrRef.current);
      } else if (data.status.toUpperCase() === "CONNECTED") {
        // Limpar QR quando conectado
        lastQrRef.current = null;
        setQr(null);
      }
    } catch {
      // silêncio em cancelamentos
    }
  };

  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    // Se não temos QR inicial, fazer fetch imediatamente
    if (!initialQr) {
      fetchStatus();
    }
    timerRef.current = window.setInterval(fetchStatus, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      abortRef.current?.abort();
      isPollingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, endpoint, intervalMs]);

  const showQr = ["QRCODE", "UNPAIRED", "PAIRING", "CONNECTING"].includes(status.toUpperCase()) && !!qr;

  return (
    <div className="flex flex-col items-center gap-3">
      {showQr && (
        <img
          alt="QR para conectar"
          src={qr?.startsWith("data:image") ? qr : `data:image/png;base64,${qr}`}
          className="w-64 h-64 border rounded-xl"
        />
      )}

      {!showQr && pairingCode && (
        <div className="text-sm font-mono px-3 py-2 border rounded">
          Código de pareamento: {pairingCode}
        </div>
      )}

      {status === "CONNECTED" && (
        <div className="text-green-600 font-medium">✅ Dispositivo conectado</div>
      )}

      {!showQr && status !== "CONNECTED" && !pairingCode && (
        <div className="text-sm opacity-70">Gerando/renovando QR…</div>
      )}

      <div className="text-xs opacity-50">Status: {status}</div>
    </div>
  );
}