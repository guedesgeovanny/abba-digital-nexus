import { useEffect, useRef, useState } from "react";

type Sessao = { status: string; qr?: string | null; error?: string };

export default function QrPolling({
  instance,
  endpoint,
  intervalMs = 2000,
}: {
  instance: string;
  endpoint: string;
  intervalMs?: number;
}) {
  const [status, setStatus] = useState<string>("LOADING");
  const [qr, setQr] = useState<string | null>(null);
  const lastQrRef = useRef<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isPollingRef = useRef<boolean>(false);

  const fetchStatus = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const url = `${endpoint}?instance=${encodeURIComponent(instance)}&t=${Date.now()}`;
      const r = await fetch(url, {
        signal: ac.signal,
        headers: { "cache-control": "no-cache" },
      });
      const j: Sessao = await r.json();

      const nextStatus = (j.status || "UNKNOWN").toUpperCase();
      setStatus(nextStatus);

      const incomingQr = j.qr ?? null;
      if (incomingQr) {
        lastQrRef.current = incomingQr;
        setQr(incomingQr);
      } else if (["QRCODE", "UNPAIRED", "PAIRING"].includes(nextStatus)) {
        setQr(lastQrRef.current);
      } else {
        lastQrRef.current = null;
        setQr(null);
      }
    } catch {}
  };

  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    fetchStatus();
    timerRef.current = window.setInterval(fetchStatus, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      abortRef.current?.abort();
      isPollingRef.current = false;
    };
  }, [instance, endpoint, intervalMs]);

  const showQr = ["QRCODE", "UNPAIRED", "PAIRING"].includes(status) && !!qr;

  return (
    <div className="flex flex-col items-center gap-3">
      {showQr && (
        <>
          <img
            alt="QR para conectar"
            src={`data:image/png;base64,${qr}`}
            className="w-64 h-64 border rounded-xl"
          />
          <p className="text-sm opacity-70">
            WhatsApp → Dispositivos conectados → Ler QR.
          </p>
        </>
      )}

      {status === "CONNECTED" && (
        <div className="text-green-600 font-medium">✅ Dispositivo conectado</div>
      )}

      {!showQr && status !== "CONNECTED" && (
        <div className="text-sm opacity-70">Gerando/renovando QR…</div>
      )}

      <div className="text-xs opacity-50">Status: {status}</div>
    </div>
  );
}