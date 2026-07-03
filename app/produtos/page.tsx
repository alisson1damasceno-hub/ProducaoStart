"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, Image, Leaf, PackagePlus, Pencil, Save, Tags, Trash2, X } from "lucide-react";
import { Shell } from "../shared/shell";
import { PublicationsEditor, PublicationsGallery } from "../shared/publications";
import { useMvpData } from "../shared/store";
import { usePapel } from "../login/usePapel";
import type { Product } from "../shared/types";

type ProductForm = Omit<Product, "id">;

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "Poliframe",
  line: "Linha 01",
  recycledPercent: 60,
  status: "Ativo",
  publications: []
};

export default function ProductsPage() {
  const { products, sheets, orders, addProduct, updateProduct, deleteProduct } = useMvpData();
  const { podeEditar, podeExcluir } = usePapel();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);

  const activeProducts = products.filter((product) => product.status === "Ativo").length;
  const averageRecycled = products.length
    ? Math.round(products.reduce((total, product) => total + product.recycledPercent, 0) / products.length)
    : 0;
  const productsWithSheet = products.filter((product) => sheets.some((sheet) => sheet.productId === product.id)).length;
  const editingProduct = products.find((product) => product.id === editingId);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name || !form.sku) return;

    if (editingId) {
      updateProduct({ ...form, id: editingId });
    } else {
      addProduct(form);
    }

    resetForm();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setViewing(null);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      line: product.line,
      recycledPercent: product.recycledPercent,
      status: product.status,
      publications: product.publications
    });
  }

  function confirmDelete(product: Product) {
    const relatedSheets = sheets.filter((sheet) => sheet.productId === product.id);
    const relatedOrders = orders.filter((order) => relatedSheets.some((sheet) => sheet.id === order.sheetId));
    const message = `Excluir "${product.name}" também remove ${relatedSheets.length} ficha(s) e ${relatedOrders.length} OP(s) vinculada(s). Confirmar?`;
    if (window.confirm(message)) {
      deleteProduct(product.id);
      if (viewing?.id === product.id) setViewing(null);
      if (editingId === product.id) resetForm();
    }
  }

  return (
    <Shell active="produtos">
      <div className="page-header">
        <div>
          <h2>Produtos</h2>
          <div className="subtitle">Cadastre, edite, visualize e mantenha os produtos usados no fluxo produtivo.</div>
        </div>
        <Link className="btn btn-primary btn-lg" href="/ficha-tecnica">
          Próximo <ArrowRight size={18} />
        </Link>
      </div>

      <div className="kpi-row compact">
        <div className="kpi">
          <div className="kpi-icon"><Tags size={18} /></div>
          <div className="kpi-label">Produtos cadastrados</div>
          <div className="kpi-value">{products.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><CheckCircle2 size={18} /></div>
          <div className="kpi-label">Produtos ativos</div>
          <div className="kpi-value">{activeProducts}</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Leaf size={18} /></div>
          <div className="kpi-label">Média reciclada</div>
          <div className="kpi-value">{averageRecycled}%</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><PackagePlus size={18} /></div>
          <div className="kpi-label">Com ficha técnica</div>
          <div className="kpi-value">{productsWithSheet}</div>
        </div>
      </div>

      <div className="workbench-grid">
        {podeEditar ? (
        <form className="card form-panel" onSubmit={submit}>
          <div className="section-title">
            <div>
              <h3>{editingId ? "Editar produto" : "Novo produto"}</h3>
              <p>{editingProduct ? `Alterando ${editingProduct.name}` : "Dados essenciais para cadastro e rastreabilidade do produto."}</p>
            </div>
            <span className="badge badge-blue">CRUD</span>
          </div>

          <div className="form-group">
            <label className="required">Nome</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Placa Poliframe 1,20m" />
          </div>

          <div className="row">
            <div className="form-group">
              <label className="required">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="POL-120-STD" />
            </div>
            <div className="form-group">
              <label>% reciclado</label>
              <input type="number" min="0" max="100" value={form.recycledPercent} onChange={(e) => setForm({ ...form, recycledPercent: Number(e.target.value) })} />
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              <label>Categoria</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Poliframe</option>
                <option>Reparô</option>
                <option>Composteira</option>
              </select>
            </div>
            <div className="form-group">
              <label>Linha</label>
              <input value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Product["status"] })}>
              <option>Ativo</option>
              <option>Em desenvolvimento</option>
            </select>
          </div>

          <PublicationsEditor
            publications={form.publications}
            onChange={(next) => setForm({ ...form, publications: next })}
          />

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              {editingId ? <Save size={17} /> : <PackagePlus size={17} />} {editingId ? "Salvar edição" : "Salvar produto"}
            </button>
            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={resetForm}>
                <X size={16} /> Cancelar
              </button>
            )}
          </div>
        </form>
        ) : (
          <div className="card form-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#71717a", textAlign: "center" }}>
            <span style={{ fontSize: 32 }}>🔒</span>
            <strong>Acesso restrito</strong>
            <p className="subtitle">Somente Admin e Owner podem criar ou editar produtos.</p>
          </div>
        )}

        <div className="card">
          <div className="section-title">
            <div>
              <h3>Catálogo</h3>
              <p>Produtos disponíveis para ficha técnica e produção.</p>
            </div>
          </div>

          {viewing && (
            <div className="detail-panel">
              <div>
                <span className="eyebrow">Visualização</span>
                <h3>{viewing.name}</h3>
                <p>SKU {viewing.sku} · {viewing.category} · {viewing.line}</p>
                <div className="sheet-detail">
                  <span>Publicações</span>
                  <PublicationsGallery publications={viewing.publications} />
                </div>
              </div>
              <div className="detail-panel-actions">
                {podeEditar && <button className="icon-btn" type="button" onClick={() => startEdit(viewing)} title="Editar produto"><Pencil size={16} /></button>}
                {podeExcluir && <button className="icon-btn danger" type="button" onClick={() => confirmDelete(viewing)} title="Excluir produto"><Trash2 size={16} /></button>}
                <button className="icon-btn" type="button" onClick={() => setViewing(null)} title="Fechar"><X size={16} /></button>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="empty-column">Nenhum produto cadastrado ainda.</div>
          ) : (
            <div className="product-grid">
              {products.map((product) => {
                const productSheets = sheets.filter((sheet) => sheet.productId === product.id);
                const productOrders = orders.filter((order) => productSheets.some((sheet) => sheet.id === order.sheetId));
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-card-head">
                      <div className="product-avatar">{product.category.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{product.name}</strong>
                        <span className="meta">SKU: {product.sku}</span>
                      </div>
                    </div>
                    <div className="product-card-meta">
                      <span>{product.category}</span>
                      <span>{product.line}</span>
                      <span>{productOrders.length} OP(s)</span>
                    </div>
                    <div className="recycled-meter">
                      <div className="recycled-meter-top">
                        <span>Material reciclado</span>
                        <strong>{product.recycledPercent}%</strong>
                      </div>
                      <div className="progress-mini">
                        <div className="bar" style={{ width: `${product.recycledPercent}%` }} />
                      </div>
                    </div>
                    <div className="product-card-footer">
                      <span className="badge badge-green">{product.status}</span>
                      <span className={`badge ${productSheets.length ? "badge-blue" : "badge-orange"}`}>
                        {productSheets.length ? "Ficha vinculada" : "Sem ficha"}
                      </span>
                    </div>
                    {product.publications.length > 0 && (
                      <div className="product-card-meta publications-card-indicator">
                        <span><Image size={12} /> {product.publications.length} publicação(ões)</span>
                      </div>
                    )}
                    <div className="crud-actions">
                      <button className="icon-btn" type="button" onClick={() => setViewing(product)} title="Visualizar produto"><Eye size={16} /></button>
                      {podeEditar && <button className="icon-btn" type="button" onClick={() => startEdit(product)} title="Editar produto"><Pencil size={16} /></button>}
                      {podeExcluir && <button className="icon-btn danger" type="button" onClick={() => confirmDelete(product)} title="Excluir produto"><Trash2 size={16} /></button>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
