"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ArrowRight,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { GithubIcon } from "./GithubIcon";
import { BrandLogo } from "./BrandLogo";
import { useToast } from "./Toast";

interface LoginViewProps {
  isOAuthConfigured: boolean;
  onLoginSuccess: () => void;
  oauthError?: string | null;
}

export function LoginView({
  isOAuthConfigured,
  onLoginSuccess,
  oauthError,
}: LoginViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"pat" | "oauth">(
    isOAuthConfigured ? "oauth" : "pat"
  );
  const [patToken, setPatToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(oauthError || null);

  const handlePatLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patToken.trim()) {
      setErrorMsg("Please enter your GitHub Personal Access Token.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: patToken.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed. Invalid token.");
      }

      showToast("success", "Signed in successfully", `Welcome @${data.user.login}!`);
      onLoginSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setErrorMsg(msg);
      showToast("error", "Sign in failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-[#388bfd]/30">
      <div className="w-full max-w-[420px] z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <BrandLogo className="w-14 h-14 shadow-xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            GitHub Social Manager
          </h1>
          <p className="text-xs text-[#8b949e] mt-1.5">
            Audit non-followers and manage follow-backs safely.
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl p-6">
          {/* Method Selector Tabs */}
          <div className="flex border-b border-[#30363d] mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("oauth");
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "oauth"
                  ? "border-[#2ea043] text-[#f0f6fc]"
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub OAuth
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("pat");
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "pat"
                  ? "border-[#2ea043] text-[#f0f6fc]"
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Personal Access Token
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-[#da3633]/15 border border-[#da3633]/40 text-xs text-[#f85149] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {activeTab === "oauth" ? (
            <div className="space-y-4">
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Sign in with your GitHub account to manage followers and following lists.
              </p>

              {isOAuthConfigured ? (
                <button
                  type="button"
                  onClick={handleOAuthLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-lg text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99]"
                >
                  <GithubIcon className="w-4 h-4" />
                  Continue with GitHub
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              ) : (
                <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#f0f6fc]">
                    <Info className="w-3.5 h-3.5 text-[#58a6ff]" />
                    OAuth App Not Configured
                  </div>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    OAuth credentials are not set in <code className="text-[#f0f6fc] bg-[#161b22] px-1 py-0.5 rounded">.env.local</code>. Please use Personal Access Token login below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pat")}
                    className="w-full py-1.5 px-3 text-xs font-medium text-[#58a6ff] hover:text-[#79c0ff] bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    Switch to Personal Access Token Login
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handlePatLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#c9d1d9] mb-1.5">
                  GitHub Personal Access Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx or github_pat_xxxxxxxx"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-colors pr-14 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#8b949e] hover:text-[#f0f6fc] px-1.5 py-0.5 rounded"
                  >
                    {showToken ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e] text-[11px]">Required scope:</span>
                  <span className="bg-[#161b22] text-[#3fb950] px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#30363d]">
                    user:follow
                  </span>
                </div>
                <a
                  href="https://github.com/settings/tokens/new?scopes=user:follow,read:user&description=GitHub+Social+Manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#58a6ff] hover:text-[#79c0ff] hover:underline"
                >
                  <span>Generate token on GitHub with pre-selected scopes</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm transition-all shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Validating with GitHub...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    Sign In with Token
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
