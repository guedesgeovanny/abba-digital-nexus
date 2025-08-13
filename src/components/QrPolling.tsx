import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type RawResp = any;
type Sessao = { status: string; qr?: string | null; pairingCode?: string | null; error?: string };

function normalizeResp(resp: RawResp): Sessao {
  const j = Array.isArray(resp) ? (resp[0] ?? {}) : (resp ?? {});

  // status pode vir encapsulado em j.instance.status
  let rawStatus = (j.instance && typeof j.instance === 'object' && (j.instance.status as string))
    || (j.status as string)
    || (j.state as string)
    || (j.pairingCode || j.code ? "PAIRING" : null)
    || "UNKNOWN";
  const status = String(rawStatus).toUpperCase();

  // localizar QR - buscar em diferentes campos conhecidos
  let qr: string | null = (j.qr as string) ?? (j.base64 as string) ?? (j.image as string) ?? null;
  // se não tiver prefixo data:image, adicionaremos apenas na renderização

  const pairingCode: string | null = (j.pairingCode as string) ?? (j.code as string) ?? null;

  return { status, qr, pairingCode };
}

// Usa a MESMA lógica do botão "Verificar Agora" de WhatsAppConnections.tsx
function isTargetConnectedPayload(raw: any): boolean {
  console.log('🔍 [isTargetConnectedPayload] Checking payload:', raw);
  
  // Verifica se é um objeto direto (não array)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    console.log('❌ [isTargetConnectedPayload] Not a direct object');
    return false;
  }
  
  console.log('📋 [isTargetConnectedPayload] Direct object:', raw);
  
  // MESMA lógica do verifyAllConnections: 
  // data.connected === true OU status em ['open', 'connected', 'ready', 'active']
  const connected = raw.connected === true || 
                   (typeof raw.status === 'string' && 
                    ['open', 'connected', 'ready', 'active'].includes(raw.status.toLowerCase()));
  
  console.log('🎯 [isTargetConnectedPayload] connected:', raw.connected);
  console.log('🎯 [isTargetConnectedPayload] status:', raw.status);
  console.log('🎯 [isTargetConnectedPayload] contato:', raw.contato);
  console.log('🎯 [isTargetConnectedPayload] profilename:', raw.profilename);
  console.log('🎯 [isTargetConnectedPayload] fotodoperfil:', raw.fotodoperfil);
  console.log('🎯 [isTargetConnectedPayload] isConnected:', connected);
  
  return connected;
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
  const [expired, setExpired] = useState<boolean>(false);

  const lastQrRef = useRef<string | null>(initialQr || null);
  const timerRef = useRef<number | null>(null); // polling interval
  const timeoutRef = useRef<number | null>(null); // timeout de 120s
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

  const stopAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const fetchStatus = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // Usar endpoint de verificação de status específico (sempre)
      const statusUrl = 'https://webhock-veterinup.abbadigital.com.br/webhook/verifica-status-mp-brasil';
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
        return; // Não alterar o estado em caso de erro de rede
      }

      const raw = await r.json();
      console.log('📊 [QrPolling] Raw response:', raw);

      // Condição de sucesso usando a MESMA lógica do "Verificar Agora"
      if (isTargetConnectedPayload(raw)) {
        console.log('🎯 [QrPolling] Target connected payload detected.');
        setStatus('CONNECTED');
        lastQrRef.current = null;
        setQr(null);
        stopAllTimers();
        abortRef.current?.abort();
        
        // Passar os dados no formato esperado pelo handleConnected (igual ao "Verificar Agora")
        const profileData = {
          profilename: raw.profilename || null,
          contato: raw.contato || null,
          fotodoperfil: raw.fotodoperfil || null
        };
        
        if (onConnected) onConnected(profileData);
        return;
      }

      const data = normalizeResp(raw);
      console.log('✅ [QrPolling] Normalized data:', data);

      // Atualizar status e pairing code (exibir status vindo de instance.status se presente)
      setStatus(data.status);
      setPairingCode(data.pairingCode ?? null);

      // Manter QR visível até a condição de sucesso acima
      if (data.qr && data.qr !== lastQrRef.current) {
        console.log('🆕 [QrPolling] New QR received, updating...');
        lastQrRef.current = data.qr;
        setQr(data.qr);
      } else if (!qr && lastQrRef.current) {
        console.log('🔄 [QrPolling] Restoring QR from backup...');
        setQr(lastQrRef.current);
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ [QrPolling] Polling error:', error);
      }
    }
  };

  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    console.log('🚀 [QrPolling] Starting polling for instance:', instance);
    console.log('⏱️ [QrPolling] Interval:', intervalMs + 'ms');
    console.log('📱 [QrPolling] Initial QR available:', !!initialQr);

    setExpired(false);

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

    // Timeout de 120s para exibir opção de tentar novamente (sem fechar modal)
    timeoutRef.current = window.setTimeout(() => {
      console.log('⏳ [QrPolling] Timeout reached (120s).');
      setExpired(true);
    }, 120000);

    return () => {
      console.log('🛑 [QrPolling] Cleanup: stopping polling...');
      stopAllTimers();
      abortRef.current?.abort();
      isPollingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, endpoint, intervalMs]);

  const retryTimeout = () => {
    console.log('🔁 [QrPolling] Retry requested by user.');
    setExpired(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      console.log('⏳ [QrPolling] Timeout reached (120s) after retry.');
      setExpired(true);
    }, 120000);
    fetchStatus();
  };

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

      {expired && (
        <div className="text-center space-y-3">
          <div className="text-sm text-destructive">Tempo esgotado. Tente novamente.</div>
          <Button variant="outline" onClick={retryTimeout}>Tentar novamente</Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Status: <span className="font-mono">{status}</span>
      </div>
    </div>
  );
}
