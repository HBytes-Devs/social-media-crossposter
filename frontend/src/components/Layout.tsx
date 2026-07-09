import { NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectAuth } from "../store/slices/authSlice";

const navItems = [
  { to: "/", label: "Compose", icon: "✏️" },
  { to: "/posts", label: "Posts", icon: "📋" },
  { to: "/accounts", label: "Accounts", icon: "🔗" },
];

export function Layout() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-lg font-bold tracking-tight text-white">SMC</h1>
          <p className="mt-1 text-xs text-slate-400">Social Media Crossposter</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600/20 text-brand-100"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-slate-200">
            {user?.name ?? user?.email}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
