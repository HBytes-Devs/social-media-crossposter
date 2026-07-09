import type { PlatformStatus, SocialAccount } from "../../types";
import { Button } from "../ui/Button";

type Props = {
  platform: PlatformStatus;
  account?: SocialAccount;
  connecting: boolean;
  onConnect: (slug: string) => void;
  onDisconnect?: (accountId: string) => void;
};

function PlatformIcon({ platform }: { platform: PlatformStatus }) {
  const colors: Record<string, string> = {
    LINKEDIN: "#0A66C2",
    INSTAGRAM: "#E4405F",
    FACEBOOK: "#1877F2",
    TWITTER: "#1d9bf0",
    REDDIT: "#FF4500",
  };

  const icons: Record<string, string> = {
    LINKEDIN: "in",
    INSTAGRAM: "IG",
    FACEBOOK: "f",
    TWITTER: "𝕏",
    REDDIT: "r/",
  };

  const bg = platform.configured ? (colors[platform.id] ?? "#334155") : "#334155";

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
      style={{ backgroundColor: bg }}
    >
      {icons[platform.id] ?? "?"}
    </div>
  );
}

export function PlatformCard({
  platform,
  account,
  connecting,
  onConnect,
  onDisconnect,
}: Props) {
  const isConnected = Boolean(account);
  const canConnect = platform.configured && platform.implemented;

  return (
    <div
      className={`rounded-xl border p-5 transition ${
        isConnected
          ? "border-brand-500/40 bg-brand-600/5"
          : "border-slate-700 bg-slate-900/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <PlatformIcon platform={platform} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{platform.name}</h3>
              {!platform.configured && (
                <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                  Setup required
                </span>
              )}
              {isConnected && (
                <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-[10px] font-medium text-green-300">
                  Connected
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{platform.description}</p>
            {isConnected && account && (
              <p className="mt-2 text-sm text-slate-300">
                {account.accountName ?? account.accountId}
                {account.expiresAt && (
                  <span className="text-slate-500">
                    {" "}
                    · expires {new Date(account.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            )}
            {!platform.configured && platform.setupHint && (
              <p className="mt-2 text-xs text-slate-500">{platform.setupHint}</p>
            )}
            {canConnect && !isConnected && (
              <p className="mt-2 text-xs text-slate-500">
                OAuth se connect — secure official login popup
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {!canConnect ? (
            <Button variant="secondary" disabled title={platform.setupHint}>
              Setup .env
            </Button>
          ) : isConnected ? (
            <Button variant="ghost" onClick={() => onDisconnect?.(account!.id)}>
              Disconnect
            </Button>
          ) : (
            <Button loading={connecting} onClick={() => onConnect(platform.slug)}>
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlatformGrid({
  platforms,
  accounts,
  connectingPlatform,
  onConnect,
  onDisconnect,
}: {
  platforms: PlatformStatus[];
  accounts: SocialAccount[];
  connectingPlatform: string | null;
  onConnect: (slug: string) => void;
  onDisconnect: (accountId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {platforms.map((platform) => {
        const account = accounts.find((a) => a.platform === platform.id);
        return (
          <PlatformCard
            key={platform.id}
            platform={platform}
            account={account}
            connecting={connectingPlatform === platform.id}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        );
      })}
    </div>
  );
}
