"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Se o <html> já tem data-theme (usuário escolheu antes nesta sessão), respeita.
    // Senão, usa o que estiver salvo no localStorage.
    // Senão, usa a preferência do sistema (o CSS já aplicou isso sozinho, aqui só
    // sincronizamos o ícone do botão com o que está sendo exibido).
    const current = document.documentElement.getAttribute("data-theme");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {
      // localStorage indisponível — ignora
    }

    if (current === "dark" || current === "light") {
      setTheme(current);
    } else if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      setTheme(getSystemTheme());
    }

    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage indisponível (modo privado, etc.) — ignora
    }
  }

  // Evita mismatch de hidratação: só decide o ícone depois de montar no client
  if (!mounted) {
    return <button className="theme-toggle" aria-label="Alternar tema" />;
  }

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      type="button"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
