import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <App />
    <Toaster />
  </ThemeProvider>
);
