"use client";

import { ChangeEvent, useState } from "react";
import { ImageOff, ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Publication } from "./types";

const MAX_FILE_SIZE_MB = 5;
const BUCKET = "publications";

function createPublicationId() {
  return `pub-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

type PublicationsEditorProps = {
  publications: Publication[];
  onChange: (next: Publication[]) => void;
};

export function PublicationsEditor({ publications, onChange }: PublicationsEditorProps) {
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Imagem maior que ${MAX_FILE_SIZE_MB}MB. Escolha um arquivo menor.`);
      return;
    }

    setError("");
    setUploading(true);

    const path = `${Date.now()}-${Math.random().toString(16).slice(2)}-${sanitizeFileName(file.name)}`;

    try {
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const nextPublication: Publication = {
        id: createPublicationId(),
        imageUrl: data.publicUrl,
        caption: caption.trim(),
        createdAt: new Date().toISOString()
      };

      onChange([...publications, nextPublication]);
      setCaption("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  function removePublication(id: string) {
    onChange(publications.filter((item) => item.id !== id));
  }

  return (
    <div className="form-group">
      <div className="publications-editor-head">
        <label>Publicações</label>
      </div>

      <div className="publications-upload-row">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Legenda da imagem"
          disabled={uploading}
        />
        <label className="btn btn-secondary compact-btn publications-upload-btn">
          <ImagePlus size={15} /> {uploading ? "Enviando..." : "Adicionar imagem"}
          <input type="file" accept="image/*" onChange={handleFileSelected} disabled={uploading} hidden />
        </label>
      </div>

      {error && <p className="publications-error">{error}</p>}

      {publications.length > 0 && (
        <div className="publications-list">
          {publications.map((publication) => (
            <div className="publications-item" key={publication.id}>
              <img src={publication.imageUrl} alt={publication.caption || "Publicação"} />
              <span>{publication.caption || "Sem legenda"}</span>
              <button
                className="icon-btn danger"
                type="button"
                onClick={() => removePublication(publication.id)}
                title="Remover publicação"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PublicationsGalleryProps = {
  publications: Publication[];
  emptyLabel?: string;
};

export function PublicationsGallery({ publications, emptyLabel = "Nenhuma publicação cadastrada." }: PublicationsGalleryProps) {
  if (!publications.length) {
    return (
      <p className="publications-empty">
        <ImageOff size={14} /> {emptyLabel}
      </p>
    );
  }

  return (
    <div className="publications-gallery">
      {publications.map((publication) => (
        <figure className="publications-gallery-item" key={publication.id}>
          <img src={publication.imageUrl} alt={publication.caption || "Publicação"} />
          <figcaption>{publication.caption || "Sem legenda"}</figcaption>
        </figure>
      ))}
    </div>
  );
}
