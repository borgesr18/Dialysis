"use client";

import { useEffect, useRef } from "react";

/**
 * Reloads the page once when a Next.js ChunkLoadError occurs (stale deployment/runtime).
 * Uses sessionStorage flag to avoid infinite reload loops.
 */
export default function ChunkReload() {
	const handledRef = useRef(false);

	useEffect(() => {
		if (handledRef.current) return;

		function triggerReloadOnce() {
			try {
				if (sessionStorage.getItem("__chunk_reloaded__") === "1") {
					return;
				}
				sessionStorage.setItem("__chunk_reloaded__", "1");
				handledRef.current = true;
				if (typeof window !== "undefined") {
					window.location.reload();
				}
			} catch {
				handledRef.current = true;
				if (typeof window !== "undefined") {
					window.location.reload();
				}
			}
		}

		function onError(e: ErrorEvent) {
			const message = String(e?.message || "");
			const isChunkError =
				message.includes("ChunkLoadError") ||
				message.includes("Loading chunk") ||
				(message.includes("failed") && message.includes("chunk"));

			if (isChunkError) {
				triggerReloadOnce();
			}
		}

		function onUnhandledRejection(e: PromiseRejectionEvent) {
			const reason = e?.reason;
			const text = typeof reason === "string" ? reason : String(reason?.message || "");
			const isChunkError =
				text.includes("ChunkLoadError") ||
				text.includes("Loading chunk") ||
				(text.includes("failed") && text.includes("chunk"));
			if (isChunkError) {
				triggerReloadOnce();
			}
		}

		window.addEventListener("error", onError);
		window.addEventListener("unhandledrejection", onUnhandledRejection);
		return () => {
			window.removeEventListener("error", onError);
			window.removeEventListener("unhandledrejection", onUnhandledRejection);
		};
	}, []);

	return null;
}