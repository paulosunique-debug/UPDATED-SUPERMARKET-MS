import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTranslation } from '../../hooks/useTranslation';

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
  title?: string;
}

export function BarcodeScannerModal({ open, onClose, onDetected, title }: BarcodeScannerModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    let cancelled = false;

    async function start() {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const videoInputs = await BrowserMultiFormatReader.listVideoInputDevices();
        if (cancelled) return;
        setDevices(videoInputs);

        // Prefer a back/rear camera on phones if labeled, otherwise the last device (often the back camera).
        const rear = videoInputs.find((d) => /back|rear|environment/i.test(d.label));
        const chosen = deviceId ?? rear?.deviceId ?? videoInputs[videoInputs.length - 1]?.deviceId;
        setDeviceId(chosen);

        if (!videoRef.current) return;
        setScanning(true);

        const controls = await reader.decodeFromVideoDevice(chosen, videoRef.current, (result, err) => {
          if (result) {
            onDetected(result.getText());
            controls.stop();
            setScanning(false);
            onClose();
          }
        });
        controlsRef.current = controls;
      } catch (e: any) {
        if (cancelled) return;
        setError(
          e?.name === 'NotAllowedError'
            ? 'Camera access was denied. Please allow camera permissions and try again.'
            : e?.name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : 'Could not start the camera. You can type the code in manually instead.'
        );
        setScanning(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      setScanning(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deviceId]);

  return (
    <Modal open={open} onClose={onClose} title={title ?? 'Scan Barcode'} size="sm">
      <div className="flex flex-col gap-3">
        {error ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-tomato-200 bg-tomato-50 p-6 text-center text-sm text-tomato-600 dark:border-tomato-500/30 dark:bg-tomato-500/10">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg bg-black">
            <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-market-400/80" />
            {scanning && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                Point the camera at a barcode…
              </div>
            )}
          </div>
        )}

        {devices.length > 1 && !error && (
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-slate2-400" />
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="h-8 flex-1 rounded-lg border border-slate2-200 bg-white px-2 text-xs dark:border-slate2-600 dark:bg-slate2-800 dark:text-slate2-50"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || 'Camera'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          {error && (
            <Button variant="outline" className="flex-1" onClick={() => setError(null)}>
              <RefreshCw className="h-4 w-4" /> {t('common_reset')}
            </Button>
          )}
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="h-4 w-4" /> {t('common_cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
