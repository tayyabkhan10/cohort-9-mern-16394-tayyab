import { Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";

function Placeholder({ label }: Readonly<{ label: string }>): JSX.Element {
  return <div className="p-8 text-center">{label}</div>;
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Placeholder label="login" />} />
      <Route path="/dashboard" element={<Placeholder label="dashboard" />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
