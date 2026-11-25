export interface ToastMessage {
  id: number;
  text: string;
}

export function CyberToastHost({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="cyber-toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="cyber-toast">
          {toast.text}
        </div>
      ))}
    </div>
  );
}
