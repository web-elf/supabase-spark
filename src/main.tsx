import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("ENV check:", !!import.meta.env.VITE_SUPABASE_URL, !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")!).render(<App />);
