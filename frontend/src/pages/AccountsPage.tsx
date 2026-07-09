import { useEffect } from "react";
import { PlatformGrid } from "../components/accounts/PlatformCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  connectPlatform,
  disconnectAccount,
  fetchAccounts,
  fetchPlatforms,
  selectAccounts,
} from "../store/slices/accountsSlice";

export function AccountsPage() {
  const dispatch = useAppDispatch();
  const {
    items: accounts,
    platforms,
    loading,
    platformsLoading,
    connecting,
    error,
  } = useAppSelector(selectAccounts);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  function refreshAll() {
    dispatch(fetchAccounts());
    dispatch(fetchPlatforms());
  }

  const configuredCount = platforms.filter((p) => p.configured).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Connected Accounts</h1>
        <p className="mt-1 text-sm text-slate-400">
          Social platforms connect karo taake post publish ho sake
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <Card
        title="How to connect?"
        description="Manual username/password enter nahi hota — sirf OAuth"
      >
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            Har platform <strong className="text-white">OAuth</strong> se connect hota hai. Ek click
            par official login popup khulta hai.
          </p>
          <ol className="list-inside list-decimal space-y-1 text-slate-400">
            <li>Neeche se platform choose karo</li>
            <li>
              <strong className="text-slate-300">Connect</strong> dabao — popup mein authorize karo
            </li>
            <li>
              Wapas aake <strong className="text-slate-300">Refresh</strong> dabao
            </li>
          </ol>
          {configuredCount < platforms.length && (
            <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
              {platforms.length - configuredCount} platform(s) ke liye abhi{" "}
              <code className="text-amber-100">backend/.env</code> mein API keys add karni hain.
              &quot;Setup required&quot; wale cards dekho.
            </p>
          )}
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={refreshAll}>
            Refresh list
          </Button>
        </div>
      </Card>

      <Card title="Platforms" description={`${configuredCount} configured · ${platforms.length} total`}>
        {loading || platformsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <PlatformGrid
            platforms={platforms}
            accounts={accounts}
            connectingPlatform={connecting}
            onConnect={(slug) => dispatch(connectPlatform(slug))}
            onDisconnect={(id) => dispatch(disconnectAccount(id))}
          />
        )}
      </Card>
    </div>
  );
}
