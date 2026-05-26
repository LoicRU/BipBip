import { useEffect } from "react";

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "from-green-500 to-emerald-500",
    error: "from-red-500 to-pink-500",
    info: "from-blue-500 to-purple-500",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-pulse">
      <div
        className={`px-5 py-3 rounded-2xl text-white shadow-2xl bg-linear-to-r ${colors[type]}`}
      >
        {message}
      </div>
    </div>
  );
}
