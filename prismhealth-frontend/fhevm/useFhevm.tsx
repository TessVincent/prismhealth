"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import { FhevmInstance } from "./fhevmTypes";
import { createFhevmInstance, FhevmAbortError } from "./internal/fhevm";

export type FhevmGoState = "idle" | "loading" | "ready" | "error";

export function useFhevm(parameters: {
  provider: string | ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  enabled?: boolean;
  initialMockChains?: Readonly<Record<number, string>>;
}): {
  instance: FhevmInstance | undefined;
  refresh: () => void;
  error: Error | undefined;
  status: FhevmGoState;
} {
  const [instance, _setInstance] = useState<FhevmInstance | undefined>(
    undefined
  );
  const [status, _setStatus] = useState<FhevmGoState>("idle");
  const [error, _setError] = useState<Error | undefined>(undefined);
  const [_isRunning, _setIsRunning] = useState<boolean>(parameters.enabled ?? true);
  const [_providerChanged, _setProviderChanged] = useState<number>(0);
  const _abortControllerRef = useRef<AbortController | null>(null);
  const _providerRef = useRef<string | ethers.Eip1193Provider | undefined>(
    parameters.provider
  );
  const _chainIdRef = useRef<number | undefined>(parameters.chainId);
  const _mockChainsRef = useRef<Record<number, string> | undefined>(
    parameters.initialMockChains
  );

  const refresh = useCallback(() => {
    if (_abortControllerRef.current) {
      _providerRef.current = undefined;
      _chainIdRef.current = undefined;
      _abortControllerRef.current.abort();
      _abortControllerRef.current = null;
    }

    _providerRef.current = parameters.provider;
    _chainIdRef.current = parameters.chainId;

    _setInstance(undefined);
    _setError(undefined);
    _setStatus("idle");

    if (parameters.provider !== undefined) {
      _setProviderChanged((prev) => prev + 1);
    }
  }, [parameters.provider, parameters.chainId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    _setIsRunning(parameters.enabled ?? true);
  }, [parameters.enabled]);

  useEffect(() => {
    if (!_isRunning) {
      if (_abortControllerRef.current) {
        _abortControllerRef.current.abort();
        _abortControllerRef.current = null;
      }
      _setInstance(undefined);
      _setError(undefined);
      _setStatus("idle");
      return;
    }

    const thisProvider = _providerRef.current;
    const thisChainId = _chainIdRef.current;

    if (thisProvider === undefined) {
      return;
    }

    const thisSignal = new AbortController();
    _abortControllerRef.current = thisSignal;

    const thisRpcUrlsByChainId = _mockChainsRef.current;

    createFhevmInstance({
      signal: thisSignal.signal,
      provider: thisProvider,
      mockChains: thisRpcUrlsByChainId,
      onStatusChange: (s) =>
        console.log(`[useFhevm] createFhevmInstance status changed: ${s}`),
    })
      .then((i) => {
        console.log(`[useFhevm] createFhevmInstance created!`);
        if (thisSignal.signal.aborted) return;

        if (thisProvider !== _providerRef.current) return;

        _setInstance(i);
        _setError(undefined);
        _setStatus("ready");
      })
      .catch((e) => {
        console.log(`Error Was thrown !!! error... ` + e.name);
        if (thisSignal.signal.aborted) return;

        if (thisProvider !== _providerRef.current) return;

        _setInstance(undefined);
        _setError(e);
        _setStatus("error");
      });
  }, [_isRunning, _providerChanged]);

  return { instance, refresh, error, status };
}

