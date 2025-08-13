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
  intervalMs = 3000,
  initialQr,
  onConnected
}: {
  instance: string;
  endpoint: string; // ex.: "https://SEU_N8N/webhook/qr-status" ou "/api/whats/status"
  intervalMs?: number;
  initialQr?: string;
  onConnected?: (profileData: any) => void;
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
      // Usar endpoint de verificação de status específico
      const statusUrl = endpoint.replace('conecta-mp-brasil', 'verifica-status-mp-brasil');
      const url = `${statusUrl}?instanceName=${encodeURIComponent(instance)}&t=${Date.now()}`;
      
      console.log('🔄 [QrPolling] Checking status for:', instance);
      console.log('🔗 [QrPolling] URL:', url);
      
      const r = await fetch(url, { 
        signal: ac.signal, 
        headers: { "cache-control": "no-cache" },
        method: 'GET'
      });
      
      if (!r.ok) {
        console.warn('⚠️ [QrPolling] Status check failed:', r.status, r.statusText);
        // Não alterar o estado em caso de erro de rede
        return;
      }
      
      const raw = await r.json();
      console.log('📊 [QrPolling] Raw response:', raw);
      
      const data = normalizeResp(raw);
      console.log('✅ [QrPolling] Normalized data:', data);

      // Atualizar status
      setStatus(data.status);
      setPairingCode(data.pairingCode ?? null);

      // Lógica crítica para manter QR visível
      if (data.status.toUpperCase() === "CONNECTED") {
        console.log('🎉 [QrPolling] Connection established! Notifying parent...');
        // Só limpar QR quando realmente conectado
        lastQrRef.current = null;
        setQr(null);
        
        // Parar polling antes de notificar
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Notificar sobre a conexão estabelecida
        if (onConnected) {
          onConnected(raw);
        }
      } else {
        console.log('🔄 [QrPolling] Not connected yet, status:', data.status);
        
        // Se há novo QR na resposta, usar ele
        if (data.qr && data.qr !== lastQrRef.current) {
          console.log('🆕 [QrPolling] New QR received, updating...');
          lastQrRef.current = data.qr;
          setQr(data.qr);
        } else if (!qr && lastQrRef.current) {
          // Se perdemos o QR mas temos um backup, restaurar
          console.log('🔄 [QrPolling] Restoring QR from backup...');
          setQr(lastQrRef.current);
        }
        // NUNCA limpar o QR se não estivermos conectados
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ [QrPolling] Polling error:', error);
        // Em caso de erro, não alterar o estado do QR
      }
    }
  };

  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    console.log('🚀 [QrPolling] Starting polling for instance:', instance);
    console.log('⏱️ [QrPolling] Interval:', intervalMs + 'ms');
    console.log('📱 [QrPolling] Initial QR available:', !!initialQr);

    // Se não temos QR inicial, fazer fetch imediatamente
    if (!initialQr) {
      console.log('🔍 [QrPolling] No initial QR, fetching status immediately...');
      fetchStatus();
    }
    
    // Iniciar polling
    timerRef.current = window.setInterval(() => {
      console.log('⏰ [QrPolling] Polling tick...');
      fetchStatus();
    }, intervalMs);

    return () => {
      console.log('🛑 [QrPolling] Cleanup: stopping polling...');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      abortRef.current?.abort();
      isPollingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, endpoint, intervalMs]);

  // QR deve aparecer se temos um QR válido E o status não é CONNECTED
  const showQr = !!qr && status.toUpperCase() !== "CONNECTED";

  return (
    <div className="flex flex-col items-center gap-4">
      {showQr && (
        <>
          <div className="border-2 border-primary rounded-xl p-2 bg-white">
            <img
              alt="QR Code para conectar WhatsApp"
              src={qr?.startsWith("data:image") ? qr : `data:image/png;base64,${qr}`}
              className="w-64 h-64 rounded-lg"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Escaneie o QR Code com seu WhatsApp</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Abra o WhatsApp no seu celular</p>
              <p>2. Toque em Mais opções → Dispositivos conectados</p>
              <p>3. Toque em Conectar dispositivo</p>
              <p>4. Aponte seu celular para esta tela</p>
            </div>
          </div>
        </>
      )}

      {!showQr && pairingCode && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Código de pareamento</p>
          <div className="text-lg font-mono px-4 py-2 border rounded-lg bg-muted">
            {pairingCode}
          </div>
          <p className="text-xs text-muted-foreground">Digite este código no WhatsApp</p>
        </div>
      )}

      {status.toUpperCase() === "CONNECTED" && (
        <div className="text-center space-y-2">
          <div className="text-green-600 font-medium text-lg">✅ Conectado com sucesso!</div>
          <p className="text-sm text-muted-foreground">Seu WhatsApp foi conectado</p>
        </div>
      )}

      {!showQr && status.toUpperCase() !== "CONNECTED" && !pairingCode && (
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="text-sm text-muted-foreground">Aguardando conexão...</div>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Status: <span className="font-mono">{status}</span>
      </div>
    </div>
  );
}