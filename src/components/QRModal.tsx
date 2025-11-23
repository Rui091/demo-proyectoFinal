import { useEffect } from 'react';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  requestInfo: {
    nombre: string;
    apellido: string;
    origin: string;
    destination: string;
  };
}

export default function QRModal({ isOpen, onClose, qrCode, requestInfo }: QRModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">🚁 Solicitud Asignada</h2>
          <p className="text-white/90 mt-1">Código QR para Recepción</p>
        </div>

        <div className="p-8 text-center">
          <div className="bg-white border-4 border-blue-500 rounded-xl p-6 mb-6 inline-block">
            <QRCodeSVG
              value={qrCode}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-lg font-semibold text-gray-800">
              {requestInfo.nombre} {requestInfo.apellido}
            </p>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Origen:</span> {requestInfo.origin}</p>
              <p><span className="font-medium">Destino:</span> {requestInfo.destination}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-blue-600 mb-1">{qrCode}</p>
            <p className="text-xs text-gray-600">Código de Verificación</p>
          </div>

          <p className="text-sm text-gray-500">
            ⏱️ Esta ventana se cerrará automáticamente en 10 segundos
          </p>
        </div>
      </div>
    </div>
  );
}
