"use client";

import { useEffect, useMemo, useState } from "react";
import { seedData } from "./seed";
import type { MvpData, ProductionOrder, TechnicalSheet, Product } from "./types";

export const STORAGE_KEY = "start-solidarium-mvp";
const API_ENABLED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const API_TIMEOUT_MS = 5000;

let apiDataCache: MvpData | null = null;
let apiDataRequest: Promise<MvpData> | null = null;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function apiGetData() {
  if (!API_ENABLED) throw new Error("Backend não configurado");
  if (apiDataCache) return apiDataCache;
  if (apiDataRequest) return apiDataRequest;

  apiDataRequest = fetchWithTimeout("/api/mvp-data", { cache: "no-store" })
  .then(async (response) => {
    if (!response.ok) throw new Error("Backend indisponível");
    apiDataCache = normalizeData((await response.json()) as MvpData);
    return apiDataCache;
  })
  .finally(() => {
    apiDataRequest = null;
  });

  return apiDataRequest;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  return fetch(url, {
    ...init,
    signal: controller.signal
  }).finally(() => window.clearTimeout(timeout));
}

function clearApiDataCache() {
  apiDataCache = null;
  apiDataRequest = null;
}

async function apiPost<T>(url: string, body: T) {
  if (!API_ENABLED) return;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(await response.text());
}

async function apiPatch<T>(url: string, body: T) {
  if (!API_ENABLED) return;

  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(await response.text());
}

async function apiDelete(url: string) {
  if (!API_ENABLED) return;

  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) throw new Error(await response.text());
}

function loadData(): MvpData {
  if (typeof window === "undefined") return seedData;

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return seedData;

  try {
    return normalizeData(JSON.parse(raw) as MvpData);
  } catch {
    return seedData;
  }
}

function normalizeData(data: MvpData): MvpData {
  return {
    products: data.products || [],
    sheets: (data.sheets || []).map((sheet) => {
      const seedSheet = seedData.sheets.find(
        (item) => item.id === sheet.id || item.code === sheet.code
      );

      return {
        ...sheet,
        rawMaterials:
        Array.isArray(sheet.rawMaterials) && sheet.rawMaterials.length
        ? sheet.rawMaterials
        : seedSheet?.rawMaterials || []
      };
    }),
    orders: (data.orders || []).map((order) => ({
      ...order,
      comments: Array.isArray(order.comments) ? order.comments : []
    }))
  };
}

export function useMvpData() {
  const [data, setData] = useState<MvpData>(seedData);
  const [ready, setReady] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [lastError, setLastError] = useState("");

  useEffect(() => {
    async function hydrate() {
      try {
        const apiData = await apiGetData();

        setData(normalizeData(apiData));
        setBackendReady(true);
        setLastError("");
      } catch {
        setData(loadData());
        setBackendReady(false);
        setLastError("Usando localStorage porque o backend ainda não respondeu.");
      } finally {
        setReady(true);
      }
    }

    hydrate();
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, ready]);

  return useMemo(
    () => ({
      ...data,
      backendReady,
      lastError,

      addProduct(product: Omit<Product, "id">) {
        const nextProduct = {
          ...product,
          id: createId("prod")
        };

        clearApiDataCache();

        setData((current) => ({
          ...current,
          products: [nextProduct, ...current.products]
        }));

        apiPost("/api/products", nextProduct).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao salvar produto.")
        );
      },

      updateProduct(product: Product) {
        clearApiDataCache();

        setData((current) => ({
          ...current,
          products: current.products.map((item) => (item.id === product.id ? product : item))
        }));

        apiPatch(`/api/products/${product.id}`, product).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao atualizar produto.")
        );
      },

      deleteProduct(productId: string) {
        clearApiDataCache();

        setData((current) => {
          const deletedSheetIds = current.sheets
          .filter((sheet) => sheet.productId === productId)
          .map((sheet) => sheet.id);

          return {
            products: current.products.filter((product) => product.id !== productId),
                sheets: current.sheets.filter((sheet) => sheet.productId !== productId),
                orders: current.orders.filter((order) => !deletedSheetIds.includes(order.sheetId))
          };
        });

        apiDelete(`/api/products/${productId}`).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao excluir produto.")
        );
      },

      addSheet(sheet: Omit<TechnicalSheet, "id" | "code">) {
        clearApiDataCache();

        setData((current) => {
          const nextNumber = current.sheets.length + 1;

          const nextSheet = {
            ...sheet,
            id: createId("sheet"),
                code: `FT-${String(nextNumber).padStart(3, "0")}`
          };

          apiPost("/api/sheets", nextSheet).catch((error) =>
          setLastError(error instanceof Error ? error.message : "Erro ao salvar ficha.")
          );

          return {
            ...current,
            sheets: [nextSheet, ...current.sheets]
          };
        });
      },

      updateSheet(sheet: TechnicalSheet) {
        clearApiDataCache();

        setData((current) => ({
          ...current,
          sheets: current.sheets.map((item) => (item.id === sheet.id ? sheet : item))
        }));

        apiPatch(`/api/sheets/${sheet.id}`, sheet).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao atualizar ficha.")
        );
      },

      deleteSheet(sheetId: string) {
        clearApiDataCache();

        setData((current) => ({
          ...current,
          sheets: current.sheets.filter((sheet) => sheet.id !== sheetId),
                              orders: current.orders.filter((order) => order.sheetId !== sheetId)
        }));

        apiDelete(`/api/sheets/${sheetId}`).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao excluir ficha.")
        );
      },

      addOrder(
        order: Omit<
        ProductionOrder,
        "id" | "code" | "lot" | "createdAt" | "stage" | "progress" | "comments"
        >
      ) {
        clearApiDataCache();

        setData((current) => {
          const nextNumber = 190 + current.orders.length + 1;

          const nextOrder: ProductionOrder = {
            ...order,
            id: createId("order"),
                code: `OP-${String(nextNumber).padStart(4, "0")}`,
                lot: `LT-${2460 + current.orders.length}`,
                stage: "recepcao" as const,
                progress: 0,
                createdAt: new Date().toISOString(),
                comments: []
          };

          apiPost("/api/orders", nextOrder).catch((error) =>
          setLastError(error instanceof Error ? error.message : "Erro ao salvar ordem.")
          );

          return {
            ...current,
            orders: [nextOrder, ...current.orders]
          };
        });
      },

      updateOrder(order: ProductionOrder) {
        clearApiDataCache();

        setData((current) => ({
          ...current,
          orders: current.orders.map((item) => (item.id === order.id ? order : item))
        }));

        apiPatch(`/api/orders/${order.id}`, order).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao atualizar ordem.")
        );
      },

      deleteOrder(orderId: string) {
        clearApiDataCache();

        setData((current) => ({
          ...current,
          orders: current.orders.filter((order) => order.id !== orderId)
        }));

        apiDelete(`/api/orders/${orderId}`).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao excluir ordem.")
        );
      },

      addComment(orderId: string, author: string, text: string) {
        const newComment = {
          id: createId("cmt"),
           author,
           text,
           createdAt: new Date().toISOString()
        };

        clearApiDataCache();

        setData((current) => {
          let updatedOrder: ProductionOrder | null = null;

          const nextOrders = current.orders.map((order) => {
            if (order.id !== orderId) return order;

            updatedOrder = {
              ...order,
              comments: [...(order.comments || []), newComment]
            };

            return updatedOrder;
          });

          if (updatedOrder) {
            apiPatch(`/api/orders/${orderId}`, updatedOrder).catch((error) =>
            setLastError(error instanceof Error ? error.message : "Erro ao salvar comentário.")
            );
          }

          return {
            ...current,
            orders: nextOrders
          };
        });
      },

      moveOrder(orderId: string, stage: ProductionOrder["stage"]) {
        clearApiDataCache();

        let nextProgress = 20;

        setData((current) => ({
          ...current,
          orders: current.orders.map((order) =>
          order.id === orderId
          ? (() => {
            nextProgress = stage === "concluido" ? 100 : Math.max(order.progress, 20);

            return {
              ...order,
              stage,
              progress: nextProgress
            };
          })()
          : order
          )
        }));

        apiPatch(`/api/orders/${orderId}`, {
          stage,
          progress: nextProgress
        }).catch((error) =>
        setLastError(error instanceof Error ? error.message : "Erro ao mover ordem.")
        );
      },

      resetDemo() {
        clearApiDataCache();
        setData(seedData);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));

          if (API_ENABLED) {
            fetch("/api/reset-demo", { method: "POST" }).finally(() => window.location.reload());
          } else {
            window.location.reload();
          }
        }
      }
    }),
    [data, backendReady, lastError]
  );
}
