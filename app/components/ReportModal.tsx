import React, { useState } from "react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; details: string }) => void;
  offerSource: string;
  offerUrl: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  offerSource,
  offerUrl,
}) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!reason) {
      setShowError(true);
      return;
    }
    onSubmit({ reason, details });
    setReason("");
    setDetails("");
    setShowError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">Denunciar oferta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 font-black hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-600 my-4">
          Nos ajude a melhorar o site compartilhando seu feedback
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Motivo da denúncia
            </label>
            <select
              className={`w-full border rounded-md px-3 py-2 ${
                showError ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (showError) setShowError(false);
              }}
            >
              <option value="">Selecione um motivo</option>
              <option value="precoIncorreto">Preço incorreto</option>
              <option value="Indisponivel">Produto indisponível</option>
              <option value="golpe">Possível golpe</option>
              <option value="outro">Outro motivo</option>
            </select>
            {showError && (
              <p className="text-red-500 text-sm mt-1">
                Selecione um motivo para a denúncia
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição{" "}
              <span className="text-gray-500 font-medium">(opcional)</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
              placeholder="Descreva o problema..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#3042FB] text-white px-4 py-2 font-black rounded-md hover:bg-[#2535E0] transition-colors"
          >
            Enviar denúncia
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
