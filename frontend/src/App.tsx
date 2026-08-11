import { Navigate, Route, Routes } from "react-router-dom";

function Placeholder({ label }: Readonly<{ label: string }>) {
  return <div className="p-8 text-center">{label}</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Placeholder label="login" />} />
      <Route path="/dashboard" element={<Placeholder label="dashboard" />} />
    </Routes>
  );
}
