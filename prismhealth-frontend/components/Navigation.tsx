"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { designTokens } from "@/design-tokens";

export function Navigation() {
  const pathname = usePathname();
  const { connect, isConnected, accounts, chainId } = useMetaMask();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <nav className="border-b" style={{ backgroundColor: designTokens.colors.light.background }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold" style={{ color: designTokens.colors.light.primary[500] }}>
              PrismHealth
            </Link>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded ${isActive("/dashboard") ? "font-semibold" : ""}`}
                style={{
                  color: isActive("/dashboard") ? designTokens.colors.light.primary[500] : designTokens.colors.light.text.secondary,
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/data-entry"
                className={`px-3 py-2 rounded ${isActive("/data-entry") ? "font-semibold" : ""}`}
                style={{
                  color: isActive("/data-entry") ? designTokens.colors.light.primary[500] : designTokens.colors.light.text.secondary,
                }}
              >
                Data Entry
              </Link>
              <Link
                href="/analysis"
                className={`px-3 py-2 rounded ${isActive("/analysis") ? "font-semibold" : ""}`}
                style={{
                  color: isActive("/analysis") ? designTokens.colors.light.primary[500] : designTokens.colors.light.text.secondary,
                }}
              >
                Analysis
              </Link>
              <Link
                href="/verification"
                className={`px-3 py-2 rounded ${isActive("/verification") ? "font-semibold" : ""}`}
                style={{
                  color: isActive("/verification") ? designTokens.colors.light.primary[500] : designTokens.colors.light.text.secondary,
                }}
              >
                Verification
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && accounts && accounts.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
                </span>
                {chainId && (
                  <span className="text-xs text-gray-500">
                    {chainId === 31337 ? "Localhost" : chainId === 11155111 ? "Sepolia" : `Chain ${chainId}`}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: designTokens.colors.light.primary[500] }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


