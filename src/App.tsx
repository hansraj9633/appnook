import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ElementType,
} from "react";
import {
  ArrowRight,
  Search,
  Menu,
  X,
  Download,
  Smartphone,
  Sparkles,
  Grid2X2,
  ChevronRight,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  SlidersHorizontal,
  LayoutDashboard,
  Package,
  Tags,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Share2,
  Copy,
  MessageCircle,
  Mail,
  Send,
  Code2,
  GraduationCap,
  Clapperboard,
  Heart,
  BriefcaseBusiness,
  Wrench,
  BookOpen,
  Layers3,
  Phone,
  Clock,
} from "lucide-react";
import {
  Link,
  NavLink,
  Routes,
  Route,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import type { AppItem } from "./data/apps";
import {
  fetchPublicApps,
  fetchPublicCategories,
  getDownloadUrl,
  type PublicApp,
} from "./data/api";

type PublicDataContextType = {
  apps: (AppItem & PublicApp)[];
  categories: string[];
  loading: boolean;
  error: string;
};

const PublicDataContext = createContext<PublicDataContextType>({
  apps: [],
  categories: [],
  loading: true,
  error: "",
});

function usePublicData() {
  return useContext(PublicDataContext);
}

function AppIcon({
  app,
  size = "normal",
}: {
  app: AppItem;
  size?: "normal" | "large";
}) {
  const colors: Record<string, string> = {
    "1": "bg-teal-700",
    "2": "bg-indigo-600",
    "3": "bg-orange-600",
    "4": "bg-sky-600",
    "5": "bg-violet-600",
  };

  return (
    <div
      className={`${size === "large" ? "h-20 w-20 rounded-2xl text-2xl" : "h-14 w-14 rounded-xl text-lg"}
      ${colors[app.id] || "bg-zinc-700"} flex shrink-0 items-center justify-center font-bold text-white shadow-sm`}
    >
      {app.icon}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", to: "/" },
    { label: "Explore Apps", to: "/apps" },
    { label: "Categories", to: "/categories" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center" aria-label="AppNook home">
          <img src="/AppNook-logo.png" alt="AppNook" className="h-8 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              style={({ isActive }) => ({
                color: isActive ? "#075cff" : "#263252",
                fontWeight: isActive ? 700 : 500,
                transition: "color 160ms ease",
              })}
              className="text-sm transition-colors hover:text-[#075cff]"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/apps"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Explore
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-zinc-100 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-zinc-100 bg-white p-5 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                color: isActive ? "#075cff" : "#263252",
                backgroundColor: isActive ? "#eff6ff" : "transparent",
                fontWeight: isActive ? 700 : 500,
                transition: "color 160ms ease, background-color 160ms ease",
              })}
              className="block rounded-lg px-3 py-3 text-sm transition-colors hover:bg-zinc-50 hover:text-[#075cff]"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link to="/" className="inline-flex" aria-label="AppNook home">
            <img src="/AppNook-logo.png" alt="AppNook" className="h-8 w-auto object-contain" />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Discover useful applications, explore new tools and download apps
            from one simple place.
          </p>
          <p className="mt-5 text-xs text-zinc-400">Apps worth keeping.</p>
        </div>
        <div>
          <h3 className="font-semibold">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
            <Link to="/apps">All applications</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Information</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms & disclaimer</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-100 py-5 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} AppNook. All rights reserved.
      </div>
    </footer>
  );
}

function SectionHeading({
  title,
  subtitle,
  link,
}: {
  title: string;
  subtitle?: string;
  link?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {link && (
        <Link
          to={link}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View all <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function AppCard({ app }: { app: AppItem }) {
  return (
    <Link
      to={`/app/${app.slug}`}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <AppIcon app={app} />
        <div className="min-w-0 flex-1 bg-[#f5f7fc]">
          <h3 className="truncate font-bold group-hover:text-indigo-600">
            {app.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">{app.category}</p>
        </div>
        <ArrowUpRight
          size={17}
          className="text-zinc-300 transition group-hover:text-indigo-600"
        />
      </div>
      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500">
        {app.description}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400">
        <span>Version {app.version}</span>
        <span>{app.size}</span>
      </div>
    </Link>
  );
}

function Home() {
  const { apps, categories, loading, error } = usePublicData();
  const featuredApps = apps.filter((app) => app.featured);
  const featured = featuredApps.length ? featuredApps : [...apps].sort((a, b) => b.downloads - a.downloads);
  const popular = [...apps].sort((a, b) => b.downloads - a.downloads);
  const [query, setQuery] = useState("");

  if (loading) return <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-24 text-center text-sm text-slate-500">Loading applications...</main>;
  if (error) return <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-24 text-center text-sm text-red-600">{error}</main>;

  const categoryIcons: ElementType[] = [Zap, ShieldCheck, Smartphone, Sparkles, Grid2X2, Search];

  return (
    <div className="flex-1">
      <section className="appnook-hero relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-16 text-center sm:pb-20 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Android apps, hand-picked
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-[#101a3d] sm:text-5xl lg:text-[54px]">
            Find the apps worth<br className="hidden sm:block" /> keeping on your <span className="text-[#1762f5]">phone.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-500">
            A calm, curated home for useful Android apps. Browse by<br className="hidden sm:block" /> purpose, read what an app does, and download it directly.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/apps?q=${encodeURIComponent(query)}`; }}
            className="mx-auto mt-7 flex max-w-[470px] items-center rounded-full border border-slate-200 bg-white p-1.5 pl-4 shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or category"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400" />
            <button className="rounded-full bg-[#1762f5] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700">Search</button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-blue-600" />Direct downloads</span>
            <span className="inline-flex items-center gap-1.5"><Zap size={13} className="text-blue-600" />Simple experience</span>
            <span className="inline-flex items-center gap-1.5"><Smartphone size={13} className="text-blue-600" />Android only</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8 pt-10">
        <SectionHeading title="Featured applications" subtitle="Handpicked applications worth exploring." link="/apps" />
        {featured.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.slice(0, 3).map((app) => <AppCard key={app.id} app={app} />)}</div>
          : <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">New hand-picked applications will appear here.</p>}
      </section>

      <div className="bg-[#f4f7fc]">
        <div className="mx-auto max-w-5xl space-y-12 px-5 py-9">
          <section>
            <SectionHeading title="Browse by purpose" subtitle="Find the right app for what you need to do." link="/categories" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                const count = apps.filter((app) => app.category === category).length;
                return <Link key={category} to={`/apps?category=${encodeURIComponent(category)}`} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm">
                  <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${count ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}><Icon size={15} /></span>
                  <p className="text-xs font-semibold text-[#172344]">{category}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{count ? `${count} app${count === 1 ? "" : "s"}` : "Coming soon"}</p>
                </Link>;
              })}
            </div>
          </section>
          <section>
            <SectionHeading title="Popular applications" subtitle="Applications people are exploring." link="/apps" />
            {popular.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{popular.slice(0, 3).map((app) => <AppCard key={app.id} app={app} />)}</div>
              : <p className="text-sm text-slate-500">Applications will appear here as they are published.</p>}
          </section>
          <section>
            <h2 className="mb-5 text-xl font-bold tracking-tight text-[#101a3d]">Why AppNook</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["01", "Curated, not crowded", "A short list of useful apps instead of an endless feed."],
                ["02", "Clear before you download", "Every listing shows its category, version and file size up front."],
                ["03", "Direct downloads", "One tap from the app page to the file. No detours."],
              ].map(([number, title, description]) => <div key={number} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-[10px] font-bold text-blue-600">{number}</p><h3 className="mt-2 text-sm font-semibold text-[#172344]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
              </div>)}
            </div>
          </section>
          <section className="mx-auto grid max-w-[760px] grid-cols-1 items-center justify-items-center gap-7 rounded-2xl bg-[#0d173b] px-7 py-7 text-white sm:grid-cols-3 sm:gap-5">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><Eye size={19} /></span>
              <div><p className="text-2xl font-bold leading-none">—</p><p className="mt-1 text-[10px] text-slate-300">Total visitors</p></div></div>
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><Download size={19} /></span>
              <div><p className="text-2xl font-bold leading-none">{apps.reduce((total, app) => total + (Number(app.downloads) || 0), 0).toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-300">Apps downloaded</p></div></div>
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><Smartphone size={19} /></span>
              <div><p className="text-2xl font-bold leading-none">{apps.length.toLocaleString()}</p><p className="mt-1 text-[10px] text-slate-300">Available apps</p></div></div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AppsPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("newest");
  const { apps, categories, loading, error } = usePublicData();

  useEffect(() => {
    setQuery(params.get("q") || "");
    setCategory(params.get("category") || "All");
  }, [params]);

  const filtered = useMemo(() => {
    let result = apps.filter((app) => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        `${app.name} ${app.description} ${app.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory = category === "All" || app.category === category;
      return matchesQuery && matchesCategory;
    });

    if (sort === "popular") {
      result = [...result].sort((a, b) => b.downloads - a.downloads);
    } else if (sort === "alphabetical") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result = [...result].sort(
        (a, b) =>
          new Date(b.updated || 0).getTime() -
          new Date(a.updated || 0).getTime(),
      );
    }
    return result;
  }, [apps, query, category, sort]);

  const updateCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    const nextParams: Record<string, string> = {};
    if (query.trim()) nextParams.q = query.trim();
    if (nextCategory !== "All") nextParams.category = nextCategory;
    setParams(nextParams);
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    const nextParams: Record<string, string> = {};
    if (nextQuery.trim()) nextParams.q = nextQuery.trim();
    if (category !== "All") nextParams.category = category;
    setParams(nextParams, { replace: true });
  };

  return (
    <main className="min-h-[60vh] flex-1 bg-[#f6f8fc]">
      <section className="mx-auto max-w-[1200px] px-5 pb-20 pt-12 sm:pt-14 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0a4bd6]">
            Application library
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.035em] text-[#0b1437] sm:text-[44px]">
            Explore applications
          </h1>
          <p className="mt-3 text-base leading-7 text-[#4a5578] sm:text-lg">
            Discover useful tools and applications in one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-full border border-[#dce3f0] bg-white px-5 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={19} className="shrink-0 text-[#7b86a3]" />
            <span className="sr-only">Search applications</span>
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search by name, description or category"
              className="w-full bg-transparent text-sm text-[#0b1437] outline-none placeholder:text-[#8791aa]"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
                aria-label="Clear search"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-full border border-[#dce3f0] bg-white px-5 sm:w-[210px]">
            <SlidersHorizontal size={17} className="shrink-0 text-[#7b86a3]" />
            <span className="sr-only">Sort applications</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full bg-transparent text-sm text-[#2a3558] outline-none"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="alphabetical">Name A–Z</option>
            </select>
          </label>
        </div>

        <div className="mt-5 -mx-1 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full flex-nowrap gap-2.5">
          {["All", ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => updateCategory(item)}
              aria-pressed={category === item}
              className={`inline-flex min-h-10 items-center rounded-full border px-5 text-sm font-medium transition ${
                category === item
                  ? "border-[#0a5cff] bg-[#0a5cff] text-white"
                  : "border-[#dce3f0] bg-white text-[#2a3558] hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {item}
            </button>
          ))}
          </div>
        </div>

        <div className="mb-4 mt-7 flex items-center justify-between">
          <p className="text-sm text-[#4a5578]" aria-live="polite">
            {loading
              ? "Loading applications..."
              : `${filtered.length} application${filtered.length === 1 ? "" : "s"} shown`}
          </p>
          {(query || category !== "All") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setParams({});
              }}
              className="text-sm font-semibold text-[#0a4bd6] hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app, index) => (
              <article
                key={app.id}
                className="group rounded-[20px] border border-[#e3e8f2] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#bfd2ff] hover:shadow-[0_12px_32px_rgba(10,31,92,0.10)]"
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <Link to={`/app/${app.slug}`} className="block">
                  <div className="flex items-center gap-3.5">
                    <AppIcon app={app} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold text-[#0b1437] group-hover:text-[#0a5cff]">
                        {app.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#4a5578]">{app.category}</p>
                    </div>
                    <ArrowUpRight
                      size={17}
                      className="shrink-0 text-[#a5aec2] transition group-hover:text-[#0a5cff]"
                    />
                  </div>
                  <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#4a5578]">
                    {app.description}
                  </p>
                </Link>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#eef1f7] pt-3 text-xs text-[#5b6686]">
                  <span className="truncate">
                    Version {app.version} · {app.size}
                  </span>
                  <a
                    href={getDownloadUrl(app.slug)}
                    className="shrink-0 font-semibold text-[#075cff] transition hover:text-blue-800"
                  >
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center">
            <Search className="mx-auto text-[#b6bfd0]" size={32} />
            <h2 className="mt-4 font-semibold text-[#0b1437]">
              No applications found
            </h2>
            <p className="mt-2 text-sm text-[#64708c]">
              Try another search or choose a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setParams({});
              }}
              className="mt-5 text-sm font-semibold text-[#0a4bd6] hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function CategoriesPage() {
  const { apps, categories, loading, error } = usePublicData();
  const [query, setQuery] = useState("");

  const categoryIcons: Record<string, ElementType> = {
    "Developer Tools": Code2,
    Education: GraduationCap,
    Entertainment: Clapperboard,
    Lifestyle: Heart,
    Productivity: BriefcaseBusiness,
    Utilities: Wrench,
    "Books & Reference": BookOpen,
  };

  const visibleCategories = categories.filter((category) =>
    category.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <main className="min-h-[60vh] flex-1 bg-[#f5f7fc]">
      <section className="mx-auto max-w-[1120px] px-5 pb-20 pt-12 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#075cff]">
            Explore AppNook
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.035em] text-[#0b1437] sm:text-[44px]">
            Browse categories
          </h1>
          <p className="mt-3 text-base leading-7 text-[#4a5578] sm:text-lg">
            Find the right applications for what you want to do.
          </p>
        </div>

        <label className="mx-auto mt-8 flex min-h-14 max-w-[560px] items-center gap-3 rounded-full border border-[#dce3f0] bg-white px-5 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <Search size={18} className="shrink-0 text-[#8791aa]" />
          <span className="sr-only">Search categories</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a category..."
            className="w-full bg-transparent text-sm text-[#0b1437] outline-none placeholder:text-[#8791aa]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear category search"
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          )}
        </label>

        <div className="mb-5 mt-9 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#101a3d]">All categories</h2>
          <p className="text-xs text-[#77829f]">
            {visibleCategories.length} categor{visibleCategories.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center text-sm text-red-600">
            {error}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-[#e3e8f2] bg-white px-6 py-12 text-center text-sm text-[#77829f]">
            Loading categories...
          </div>
        ) : visibleCategories.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category, index) => {
              const Icon = categoryIcons[category] || Layers3;
              const count = apps.filter((app) => app.category === category).length;
              return (
                <Link
                  key={category}
                  to={`/apps?category=${encodeURIComponent(category)}`}
                  className="group flex min-h-[150px] items-center gap-4 rounded-[32px] border border-[#e3e8f2] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#bfd2ff] hover:shadow-[0_12px_32px_rgba(10,31,92,0.08)] sm:p-6"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    index % 4 === 0 ? "bg-blue-50 text-[#075cff]" :
                    index % 4 === 1 ? "bg-violet-50 text-violet-600" :
                    index % 4 === 2 ? "bg-teal-50 text-teal-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-[#172344] transition group-hover:text-[#075cff]">
                      {category}
                    </span>
                    <span className="mt-1.5 block text-xs text-[#77829f]">
                      {count} {count === 1 ? "application" : "applications"}
                    </span>
                  </span>
                  <ArrowUpRight size={18} className="shrink-0 text-[#a5aec2] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#075cff]" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-14 text-center">
            <Search className="mx-auto text-[#b6bfd0]" size={30} />
            <h3 className="mt-3 font-semibold text-[#0b1437]">No categories found</h3>
            <p className="mt-1 text-sm text-[#64708c]">Try a different category name.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function AppDetails() {
  const { apps } = usePublicData();
  const { slug } = useParams();
  const app = apps.find((item) => item.slug === slug);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!app) return <NotFound />;

  const appUrl = `${window.location.origin}/app/${app.slug}`;
  const shareText = `Check out ${app.name} on AppNook`;
  const encodedUrl = encodeURIComponent(appUrl);
  const encodedText = encodeURIComponent(`${shareText} ${appUrl}`);

  const copyAppLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="flex-1 bg-[#f5f7fc]">
      <div className="mx-auto max-w-[1120px] px-5 py-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#77829f]">
          <Link to="/apps" className="hover:text-[#075cff]">Apps</Link>
          <ChevronRight size={13} />
          <Link to={`/apps?category=${encodeURIComponent(app.category)}`} className="hover:text-[#075cff]">{app.category}</Link>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#172344]">{app.name}</span>
        </nav>

        <div className="grid items-start">
          <div className="min-w-0">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <AppIcon app={app} size="large" />
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#101a3d] sm:text-[38px]">{app.name}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#eaf0fc] px-3 py-1 text-[11px] font-semibold text-[#53617f]">{app.category}</span>
                  <span className="rounded-full bg-[#eaf0fc] px-3 py-1 text-[11px] font-semibold text-[#53617f]">Android</span>
                </div>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                <a href={getDownloadUrl(app.slug)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#075cff] px-6 text-sm font-semibold text-white transition hover:bg-blue-700">
                  <Download size={17} /> Download · {app.size}
                </a>
                <button type="button" onClick={() => setShareOpen((value) => !value)} aria-expanded={shareOpen} aria-label="Share this app" className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${shareOpen ? "border-blue-600 bg-blue-600 text-white" : "border-[#e1e8f4] bg-white text-[#075cff] hover:bg-blue-50"}`}>
                  <Share2 size={18} />
                </button>
                {shareOpen && (
                  <div className="absolute right-0 top-14 z-20 w-[260px] rounded-2xl border border-[#e5eaf3] bg-white p-3 shadow-[0_14px_40px_rgba(15,35,80,0.16)]">
                    <p className="mb-3 text-xs font-semibold text-[#172344]">Share this app</p>
                    <div className="grid grid-cols-2 gap-2">
                      <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-[#e5eaf3] px-2 py-2.5 text-xs font-semibold text-[#263252] hover:border-blue-300 hover:bg-blue-50"><MessageCircle size={14} /> WhatsApp</a>
                      <a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-[#e5eaf3] px-2 py-2.5 text-xs font-semibold text-[#263252] hover:border-blue-300 hover:bg-blue-50"><Send size={14} /> Telegram</a>
                      <a href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodedUrl}`} className="flex items-center justify-center gap-2 rounded-xl border border-[#e5eaf3] px-2 py-2.5 text-xs font-semibold text-[#263252] hover:border-blue-300 hover:bg-blue-50"><Mail size={14} /> Email</a>
                      <a href={`sms:?body=${encodedText}`} className="flex items-center justify-center gap-2 rounded-xl border border-[#e5eaf3] px-2 py-2.5 text-xs font-semibold text-[#263252] hover:border-blue-300 hover:bg-blue-50"><Smartphone size={14} /> SMS</a>
                      <button type="button" onClick={copyAppLink} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#075cff] px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Link copied" : "Copy app link"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-7 grid grid-cols-3 divide-x divide-[#e7ebf3] rounded-2xl border border-[#e5eaf3] bg-white px-4 py-5 text-center">
              <div><p className="font-bold text-[#172344]">{app.version}</p><p className="mt-1 text-xs text-[#77829f]">Version</p></div>
              <div><p className="font-bold text-[#172344]">{app.size}</p><p className="mt-1 text-xs text-[#77829f]">Size</p></div>
              <div><p className="font-bold text-[#172344]">{app.downloads.toLocaleString()}</p><p className="mt-1 text-xs text-[#77829f]">Downloads</p></div>
            </section>

            {app.screenshots.length > 0 && (
              <section className="mt-9">
                <h2 className="text-xl font-bold text-[#101a3d]">Preview</h2>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {app.screenshots.map((screenshot, index) => (
                    <a key={`${screenshot}-${index}`} href={screenshot} target="_blank" rel="noreferrer" className="block w-[min(42vw,190px)] shrink-0 overflow-hidden rounded-2xl border border-[#e2e8f2] bg-[#e8edf7]">
                      <img src={screenshot} alt={`${app.name} screenshot ${index + 1}`} loading="lazy" className="aspect-[3/5] h-full w-full object-cover transition hover:scale-[1.02]" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-9">
              <h2 className="text-xl font-bold text-[#101a3d]">About this app</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5b6686]">{app.description}</p>
            </section>

            {app.features.length > 0 && (
              <section className="mt-9">
                <h2 className="text-xl font-bold text-[#101a3d]">Key Features</h2>
                <ul className="mt-4 space-y-3">
                  {app.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[#5b6686]">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#075cff]"><Zap size={13} /></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-9">
              <h2 className="text-xl font-bold text-[#101a3d]">Before you install</h2>
              <div className="mt-4 rounded-2xl border border-[#e5eaf3] bg-white p-5 text-sm leading-7 text-[#5b6686]">
                <ol className="list-inside list-decimal">
                  <li>Download the file to your phone.</li>
                  <li>Open it and allow installs from this source if Android asks.</li>
                  <li>Tap Install and open the app.</li>
                </ol>
              </div>
            </section>
          </div>


        </div>
      </div>
    </main>
  );
}


function AboutPage() {
  const { apps, categories } = usePublicData();

  const benefits = [
    {
      number: "01",
      icon: Grid2X2,
      title: "Curated discovery",
      description:
        "Explore applications in organized categories and find tools that match what you need.",
    },
    {
      number: "02",
      icon: Eye,
      title: "Clear app information",
      description:
        "Check an app's description, category, version and file size before downloading.",
    },
    {
      number: "03",
      icon: Download,
      title: "Simple downloads",
      description:
        "Open an application's page and access its available download directly.",
    },
    {
      number: "04",
      icon: ShieldCheck,
      title: "Free for everyone",
      description:
        "Every application listed on AppNook is offered to users free of charge.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Explore",
      description:
        "Browse the application library or choose a category to discover useful apps.",
    },
    {
      number: "02",
      title: "Learn",
      description:
        "Read the app details, check its version and size, and view screenshots when available.",
    },
    {
      number: "03",
      title: "Download",
      description:
        "Visit the app page and use its download option to get the application.",
    },
  ];

  return (
    <main className="flex-1 bg-[#f5f7fc]">
      <section className="relative overflow-hidden border-b border-[#e8edf6]">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(#d8e5ff 0.8px, transparent 0.8px)", backgroundSize: "20px 20px" }} />
        <div className="relative mx-auto max-w-[1120px] px-5 pb-16 pt-16 text-center sm:pb-20 sm:pt-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#075cff]">
            ABOUT APPNOOK
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-[1.12] tracking-[-0.045em] text-[#101a3d] sm:text-5xl lg:text-[54px]">
            A simpler way to discover <span className="text-[#1762f5]">Android apps.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5b6686] sm:text-base sm:leading-8">
            AppNook brings useful Android applications together in one place.
            Explore by category, understand what an app offers, and find its
            download without unnecessary complexity.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/apps" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#075cff] px-6 text-sm font-semibold text-white transition hover:bg-blue-700">
              Explore applications <ArrowRight size={16} />
            </Link>
            <Link to="/categories" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dce3f0] bg-white px-6 text-sm font-semibold text-[#263252] transition hover:border-blue-300 hover:text-[#075cff]">
              Browse categories
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1120px] gap-8 px-5 py-14 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075cff]">WHY APPNOOK EXISTS</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.035em] text-[#101a3d]">
            Finding the right app should feel simple.
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-[#5b6686] sm:text-base">
          <p>
            With so many applications available, finding a useful tool can take
            more time than expected. AppNook is designed to make that discovery
            experience more straightforward.
          </p>
          <p>
            We bring applications into one organized place and present the
            information people commonly look for before downloading: what an
            app does, which category it belongs to, its version and its file size.
          </p>
          <p>
            Our focus is to keep the experience clear and easy to use, so
            visitors can spend less time searching and more time using the tools
            that suit their needs.
          </p>
        </div>
      </section>

      <section className="border-y border-[#e8edf6] bg-white">
        <div className="mx-auto max-w-[1120px] px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075cff]">OUR DIRECTION</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#101a3d]">Mission & vision</h2>
            <p className="mt-3 text-sm leading-6 text-[#6a7591]">What guides the way we build AppNook.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[#e3eaf5] bg-[#f7faff] p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#075cff]"><Zap size={21}/></span>
              <h3 className="mt-5 text-xl font-bold text-[#172344]">Our mission</h3>
              <p className="mt-3 text-sm leading-7 text-[#5b6686]">
                To make discovering and downloading useful Android applications
                simple and accessible for everyone.
              </p>
            </article>
            <article className="rounded-2xl border border-[#e3eaf5] bg-[#f7faff] p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#075cff]"><Eye size={21}/></span>
              <h3 className="mt-5 text-xl font-bold text-[#172344]">Our vision</h3>
              <p className="mt-3 text-sm leading-7 text-[#5b6686]">
                To become a helpful destination where people can discover
                applications that support their everyday needs.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-14 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075cff]">THE APPNOOK EXPERIENCE</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#101a3d]">What makes AppNook different?</h2>
          <p className="mt-3 text-sm leading-6 text-[#6a7591]">A straightforward experience, from discovery to download.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.number} className="rounded-2xl border border-[#e3e8f2] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#bfd2ff] hover:shadow-[0_10px_28px_rgba(10,31,92,0.06)]">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4ff] text-[#075cff]"><Icon size={20}/></span>
                  <span className="text-xs font-bold tracking-wider text-[#1762f5]">{benefit.number}</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-[#172344]">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6a7591]">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#e8edf6] bg-white">
        <div className="mx-auto max-w-[1120px] px-5 py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075cff]">DISCOVER MORE</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#101a3d]">Explore by category</h2>
              <p className="mt-3 text-sm leading-6 text-[#6a7591]">Find applications organized around what you want to do.</p>
            </div>
            <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-[#075cff] hover:text-blue-800">All categories <ArrowRight size={15}/></Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => {
              const icons: ElementType[] = [Code2, GraduationCap, Clapperboard, Heart, BriefcaseBusiness, Wrench];
              const Icon = icons[index % icons.length];
              const count = apps.filter((app) => app.category === category).length;
              return (
                <Link key={category} to={`/apps?category=${encodeURIComponent(category)}`} className="rounded-xl border border-[#e3e8f2] bg-[#fbfcff] p-4 transition hover:border-[#bfd2ff] hover:bg-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#075cff]"><Icon size={17}/></span>
                  <span className="mt-3 block text-xs font-semibold text-[#172344]">{category}</span>
                  <span className="mt-1 block text-[11px] text-[#8791aa]">{count} {count === 1 ? "app" : "apps"}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-14 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#075cff]">HOW IT WORKS</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#101a3d]">Three simple steps</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-[#e3e8f2] bg-white p-6">
              <span className="text-sm font-bold tracking-wider text-[#075cff]">{step.number}</span>
              <h3 className="mt-4 text-lg font-bold text-[#172344]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6a7591]">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-16">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#0d173b] p-7 text-white sm:flex-row sm:items-center sm:p-9">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight">Ready to find your next useful app?</h2>
            <p className="mt-2 text-sm leading-6 text-[#c4cde2]">Explore the AppNook library and discover applications for your everyday needs.</p>
          </div>
          <Link to="/apps" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1762f5] px-5 text-sm font-semibold text-white transition hover:bg-blue-700">Explore apps <ArrowRight size={16}/></Link>
        </div>
      </section>
    </main>
  );
}

function SimplePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto min-h-[55vh] max-w-4xl px-5 py-16">
      <p className="text-sm font-semibold text-indigo-600">APPNOOK</p>
      <h1 className="mt-3 text-4xl font-extrabold">{title}</h1>
      <p className="mt-6 leading-8 text-zinc-600">{description}</p>
    </main>
  );
}

function ContactPage() {
  const { categories } = usePublicData();
  const [messageStatus, setMessageStatus] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [developerStatus, setDeveloperStatus] = useState("");

  const handlePreviewSubmit = (
    event: FormEvent<HTMLFormElement>,
    setStatus: (message: string) => void,
  ) => {
    event.preventDefault();
    setStatus("This form is a design preview and is not connected to a submission service yet.");
  };

  return (
    <main className="flex-1 bg-white">
      <section className="mx-auto max-w-[1120px] px-5 pb-12 pt-12 sm:pb-16 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#075cff]">CONTACT</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#101a3d] sm:text-[42px]">
            We’d love to hear from you
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#64708c] sm:text-base">
            Send a message, share feedback or report a problem. Every note is appreciated.
          </p>
        </div>

        <div className="mt-9 grid items-start gap-5 lg:grid-cols-[1.65fr_0.95fr]">
          <section className="rounded-2xl border border-[#e5eaf3] bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-[#172344]">Send a message</h2>
            <form className="mt-5 space-y-4" onSubmit={(event) => handlePreviewSubmit(event, setMessageStatus)}>
              <div>
                <label htmlFor="contact-topic" className="mb-1.5 block text-xs font-semibold text-[#53617f]">What is this about?</label>
                <select id="contact-topic" name="topic" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm text-[#263252] outline-none transition focus:border-[#075cff] focus:ring-2 focus:ring-blue-100">
                  <option>Feedback</option>
                  <option>General enquiry</option>
                  <option>Report a problem</option>
                  <option>App download issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Email address</label>
                  <input id="contact-email" name="email" type="email" required placeholder="you@example.com" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] px-3 text-sm outline-none transition placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div>
                  <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Phone number <span className="font-normal text-[#8b95aa]">(optional)</span></label>
                  <input id="contact-phone" name="phone" type="tel" placeholder="Your phone number" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] px-3 text-sm outline-none transition placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Message or feedback</label>
                <textarea id="contact-message" name="message" required rows={5} placeholder="Tell us how we can help..." className="w-full resize-y rounded-xl border border-[#dfe6f1] px-3 py-3 text-sm outline-none transition placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
              </div>
              <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075cff] px-5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Submit <Send size={15}/>
              </button>
              {messageStatus ? (
                <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{messageStatus}</p>
              ) : (
                <p className="text-xs text-[#8791aa]">Your email address would be used only to reply to your message.</p>
              )}
            </form>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-[#e5eaf3] bg-white p-5">
              <h2 className="text-lg font-bold text-[#172344]">Contact information</h2>
              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf4ff] text-[#075cff]"><Mail size={17}/></span>
                  <div><p className="text-xs text-[#8791aa]">Email</p><p className="mt-0.5 text-sm font-semibold text-[#172344]">Contact email to be added</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf4ff] text-[#075cff]"><Phone size={17}/></span>
                  <div><p className="text-xs text-[#8791aa]">Phone</p><p className="mt-0.5 text-sm font-semibold text-[#172344]">Not available</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf4ff] text-[#075cff]"><Clock size={17}/></span>
                  <div><p className="text-xs text-[#8791aa]">Typical reply time</p><p className="mt-0.5 text-sm font-semibold text-[#172344]">We aim to reply as soon as possible</p></div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e5eaf3] bg-white p-5">
              <h2 className="text-lg font-bold text-[#172344]">Quick answers</h2>
              <div className="mt-4 divide-y divide-[#edf0f5]">
                <div className="py-3 first:pt-0">
                  <h3 className="text-sm font-semibold text-[#263252]">The app will not install</h3>
                  <p className="mt-1 text-xs leading-5 text-[#71809d]">Allow installs from this source when Android asks, then try again. Also check that your device has enough storage.</p>
                </div>
                <div className="py-3 last:pb-0">
                  <h3 className="text-sm font-semibold text-[#263252]">A download is broken</h3>
                  <p className="mt-1 text-xs leading-5 text-[#71809d]">Choose “Report a problem” in the message form and include the app name and what happened.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="border-t border-[#edf0f5] bg-[#fbfcff]">
        <div className="mx-auto max-w-[1120px] px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075cff]">APPS ON DEMAND</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#101a3d] sm:text-3xl">Can’t find the app you need?</h2>
            <p className="mt-3 text-sm leading-6 text-[#64708c]">Tell us what you’re looking for. Your suggestion can help us understand what people want to discover.</p>
          </div>

          <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-[#e5eaf3] bg-white p-5 sm:p-7">
              <form className="space-y-4" onSubmit={(event) => handlePreviewSubmit(event, setRequestStatus)}>
                <div>
                  <label htmlFor="request-name" className="mb-1.5 block text-xs font-semibold text-[#53617f]">App name or idea</label>
                  <input id="request-name" name="appName" required className="min-h-11 w-full rounded-xl border border-[#dfe6f1] px-3 text-sm outline-none focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div>
                  <label htmlFor="request-category" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Category</label>
                  <select id="request-category" name="category" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm text-[#263252] outline-none focus:border-[#075cff] focus:ring-2 focus:ring-blue-100">
                    {(categories.length ? categories : ["Developer Tools", "Education", "Entertainment", "Lifestyle", "Productivity", "Utilities"]).map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="request-description" className="mb-1.5 block text-xs font-semibold text-[#53617f]">What should it do?</label>
                  <textarea id="request-description" name="description" rows={4} required className="w-full resize-y rounded-xl border border-[#dfe6f1] px-3 py-3 text-sm outline-none focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div>
                  <label htmlFor="request-link" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Link to a similar app <span className="font-normal text-[#8b95aa]">(optional)</span></label>
                  <input id="request-link" name="reference" type="url" placeholder="https://" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] px-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div>
                  <label htmlFor="request-email" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Your email</label>
                  <input id="request-email" name="email" type="email" required className="min-h-11 w-full rounded-xl border border-[#dfe6f1] px-3 text-sm outline-none focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#075cff] px-5 text-sm font-semibold text-white transition hover:bg-blue-700">Request this app</button>
                {requestStatus && <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{requestStatus}</p>}
              </form>
            </section>

            <aside className="rounded-2xl border border-[#e5eaf3] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#172344]">How it works</h2>
              <ol className="mt-5 space-y-5">
                {[
                  ["Tell us the need", "Describe the app you are looking for and what problem it solves."],
                  ["We review it", "Suggestions help us understand what applications people want."],
                  ["You hear back", "If you leave your email, we can respond when there is an update."],
                ].map(([title, description], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075cff] text-xs font-bold text-white">{index + 1}</span>
                    <div><h3 className="text-sm font-semibold text-[#263252]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#71809d]">{description}</p></div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5eaf3] bg-white">
        <div className="mx-auto max-w-[1120px] px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075cff]">FOR DEVELOPERS</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#101a3d] sm:text-3xl">Built an Android app?</h2>
            <p className="mt-3 text-sm leading-6 text-[#64708c]">
              Submit your application for consideration as a free listing on AppNook. Share a few details and our team can review it.
            </p>
          </div>

          <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-[#e5eaf3] bg-[#fbfcff] p-5 sm:p-7">
              <h3 className="text-lg font-bold text-[#172344]">Submit your application</h3>
              <form className="mt-5 space-y-4" onSubmit={(event) => handlePreviewSubmit(event, setDeveloperStatus)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="developer-name" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Developer name</label>
                    <input id="developer-name" name="developerName" required placeholder="Your name or studio" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                  </div>
                  <div>
                    <label htmlFor="developer-email" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Email address</label>
                    <input id="developer-email" name="developerEmail" type="email" required placeholder="you@example.com" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="developer-app-name" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Application name</label>
                    <input id="developer-app-name" name="appName" required placeholder="Your app name" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                  </div>
                  <div>
                    <label htmlFor="developer-category" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Category</label>
                    <select id="developer-category" name="category" className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm text-[#263252] outline-none focus:border-[#075cff] focus:ring-2 focus:ring-blue-100">
                      {(categories.length ? categories : ["Developer Tools", "Education", "Entertainment", "Lifestyle", "Productivity", "Utilities"]).map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="developer-description" className="mb-1.5 block text-xs font-semibold text-[#53617f]">What does your app do?</label>
                  <textarea id="developer-description" name="description" required rows={4} placeholder="Tell us about its purpose and key features..." className="w-full resize-y rounded-xl border border-[#dfe6f1] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <div>
                  <label htmlFor="developer-download" className="mb-1.5 block text-xs font-semibold text-[#53617f]">App download link</label>
                  <input id="developer-download" name="downloadLink" type="url" required placeholder="https://..." className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                  <p className="mt-1.5 text-[11px] text-[#8791aa]">Provide a direct APK link or a link where the app can be reviewed.</p>
                </div>
                <div>
                  <label htmlFor="developer-website" className="mb-1.5 block text-xs font-semibold text-[#53617f]">Website or privacy policy <span className="font-normal text-[#8b95aa]">(optional)</span></label>
                  <input id="developer-website" name="website" type="url" placeholder="https://..." className="min-h-11 w-full rounded-xl border border-[#dfe6f1] bg-white px-3 text-sm outline-none placeholder:text-[#9aa4b8] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"/>
                </div>
                <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#075cff] px-5 text-sm font-semibold text-white transition hover:bg-blue-700">Submit your app <ArrowRight size={16}/></button>
                {developerStatus && <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{developerStatus}</p>}
                <p className="text-xs leading-5 text-[#8791aa]">App submissions are reviewed before listing. Submitting an application does not guarantee publication.</p>
              </form>
            </section>

            <aside className="rounded-2xl border border-[#e5eaf3] bg-white p-5 sm:p-6">
              <h3 className="text-lg font-bold text-[#172344]">How app submission works</h3>
              <ol className="mt-5 space-y-5">
                {[
                  ["Share your app", "Provide its name, details and a link where it can be reviewed."],
                  ["We review it", "We check the submitted information and whether it fits AppNook."],
                  ["Hear from us", "We use your email if we need more details or have an update."],
                ].map(([title, description], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075cff] text-xs font-bold text-white">{index + 1}</span>
                    <div><h4 className="text-sm font-semibold text-[#263252]">{title}</h4><p className="mt-1 text-xs leading-5 text-[#71809d]">{description}</p></div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-xl bg-[#f3f7ff] p-4">
                <p className="text-xs font-semibold text-[#263252]">A quick note</p>
                <p className="mt-1 text-xs leading-5 text-[#71809d]">AppNook lists free applications only. Please submit apps that users can access without payment.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-xl px-5 py-24 text-center">
      <h1 className="text-6xl font-black text-indigo-600">404</h1>
      <h2 className="mt-5 text-2xl font-bold">Page not found</h2>
      <p className="mt-3 text-zinc-500">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </main>
  );
}

type AdminSection = "Dashboard" | "Apps" | "Categories" | "Messages" | "Settings";

type AdminApp = AppItem & {
  apkUrl: string;
  published: boolean;
};

type AppForm = {
  name: string;
  description: string;
  category: string;
  version: string;
  size: string;
  icon: string;
  apkUrl: string;
  features: string;
  screenshots: string;
  featured: boolean;
  published: boolean;
};

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
};

type ApiLoginResponse = {
  token: string;
  error?: string;
};

type ApiErrorResponse = {
  error?: string;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://appnook-api.appnook.workers.dev";

const emptyForm: AppForm = {
  name: "",
  description: "",
  category: "Education",
  version: "1.0.0",
  size: "",
  icon: "",
  apkUrl: "",
  features: "",
  screenshots: "",
  featured: false,
  published: false,
};

function mapApiApp(data: any): AdminApp {
  let screenshots: string[] = [];
  let features: string[] = [];

  try {
    screenshots = Array.isArray(data.screenshots)
      ? data.screenshots
      : JSON.parse(data.screenshots || "[]");
  } catch {
    screenshots = [];
  }

  try {
    features = Array.isArray(data.features)
      ? data.features
      : JSON.parse(data.features || "[]");
  } catch {
    features = [];
  }

  return {
    id: String(data.id),
    name: data.name,
    slug: data.slug,
    description: data.description,
    category: data.category || "",
    version: data.version || "",
    size: data.size || "Not specified",
    updated: data.updated_at || "Recently updated",
    icon: data.icon_key || data.name.slice(0, 2).toUpperCase(),
    screenshots,
    features,
    downloads: Number(data.downloads || 0),
    featured: Boolean(data.featured),
    apkUrl: data.apk_url || "",
    published: Boolean(data.published),
  };
}

function AdminPanel() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("appnook_admin_token") || "",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [adminApps, setAdminApps] = useState<AdminApp[]>([]);
  const [adminCategories, setAdminCategories] = useState<string[]>([]);

  const [section, setSection] = useState<AdminSection>("Dashboard");
  const [search, setSearch] = useState("");
  const [appCategoryFilter, setAppCategoryFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [editing, setEditing] = useState<AdminApp | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<AppForm>(emptyForm);
  const [screenshotUploading, setScreenshotUploading] = useState(false);

  const [navigation] = useState<{ label: AdminSection; icon: ElementType }[]>([
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Apps", icon: Package },
    { label: "Categories", icon: Tags },
    { label: "Messages", icon: MessageCircle },
    { label: "Settings", icon: Settings },
  ]);

  async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body instanceof FormData) {
      headers.delete("Content-Type");
    } else {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const result = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data: unknown = await result.json().catch(() => ({}));

    if (result.status === 401) {
      sessionStorage.removeItem("appnook_admin_token");
      setToken("");
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!result.ok) {
      const errorData = data as ApiErrorResponse;
      throw new Error(errorData.error || "Something went wrong.");
    }

    return data as T;
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [appsData, categoriesData] = await Promise.all([
        apiRequest<unknown[]>("/api/admin/apps"),

        fetch(`${API_BASE}/api/categories`).then(async (response) => {
          if (!response.ok) {
            throw new Error("Could not load categories.");
          }

          return (await response.json()) as ApiCategory[];
        }),
      ]);

      setAdminApps(appsData.map(mapApiApp));
      setAdminCategories(categoriesData.map((item) => item.name));

      setAdminApps(appsData.map(mapApiApp));
      setAdminCategories(categoriesData.map((item: any) => item.name));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadDashboard();
    }
  }, [token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as ApiLoginResponse;

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      sessionStorage.setItem("appnook_admin_token", data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("appnook_admin_token");
    setToken("");
    setAdminApps([]);
    setNotice("");
    setError("");
    setSection("Dashboard");
  }

  function openAddForm() {
    setEditing(null);
    setForm({
      ...emptyForm,
      category: adminCategories[0] || "Education",
    });
    setShowForm(true);
  }

  function openEditForm(app: AdminApp) {
    setEditing(app);
    setForm({
      name: app.name,
      description: app.description,
      category: app.category,
      version: app.version,
      size: app.size,
      icon: app.icon,
      apkUrl: app.apkUrl,
      features: app.features.join(", "),
      screenshots: app.screenshots.join(", "),
      featured: app.featured,
      published: app.published,
    });
    setShowForm(true);
  }

  async function uploadScreenshots(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError("");
    setNotice("");
    setScreenshotUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const result = await apiRequest<{ success: boolean; url: string }>(
          "/api/admin/media",
          {
            method: "POST",
            body: formData,
          },
        );

        uploadedUrls.push(result.url);
      }

      setForm((current) => ({
        ...current,
        screenshots: [
          ...current.screenshots
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          ...uploadedUrls,
        ].join(", "),
      }));

      setNotice(`${uploadedUrls.length} screenshot(s) uploaded successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Screenshot upload failed.",
      );
    } finally {
      setScreenshotUploading(false);
    }
  }

  async function saveApp() {
    setError("");
    setNotice("");

    if (!form.apkUrl.trim()) {
      setError("Please provide the GitHub Release APK URL.");
      return;
    }

    if (
      !/^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\/.+\.apk(?:\?.*)?$/i.test(
        form.apkUrl.trim(),
      )
    ) {
      setError("Enter a valid GitHub Releases APK download URL.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      version: form.version.trim(),
      size: form.size.trim(),
      icon_key: form.icon.trim() || form.name.trim().slice(0, 2).toUpperCase(),
      apk_url: form.apkUrl.trim(),
      screenshots: form.screenshots
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      features: form.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      featured: form.featured,
      published: form.published,
    };

    try {
      if (editing) {
        await apiRequest(`/api/admin/apps/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Application updated successfully.");
      } else {
        await apiRequest("/api/admin/apps", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Application added successfully.");
      }

      setShowForm(false);
      setEditing(null);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save application.",
      );
    }
  }

  async function deleteApp(app: AdminApp) {
    if (!window.confirm(`Delete "${app.name}" permanently?`)) return;

    setError("");
    try {
      await apiRequest(`/api/admin/apps/${app.id}`, {
        method: "DELETE",
      });
      setNotice("Application deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete application.",
      );
    }
  }

  async function togglePublished(app: AdminApp) {
    setError("");

    try {
      await apiRequest(`/api/admin/apps/${app.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: app.name,
          description: app.description,
          category: app.category,
          version: app.version,
          size: app.size,
          icon_key: app.icon,
          apk_url: app.apkUrl,
          screenshots: app.screenshots,
          features: app.features,
          featured: app.featured,
          published: !app.published,
        }),
      });

      setNotice(
        app.published
          ? "Application moved to drafts."
          : "Application published.",
      );
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryInput.trim();

    if (!name) return;

    setError("");

    try {
      await apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setCategoryInput("");
      setNotice("Category added successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category.");
    }
  }

  async function removeCategory(name: string) {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    setError("");

    try {
      const categoriesResponse = await fetch(`${API_BASE}/api/categories`);
      const categoriesData = (await categoriesResponse.json()) as ApiCategory[];
      const category = categoriesData.find((item: any) => item.name === name);

      if (!category) throw new Error("Category not found.");

      await apiRequest(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      setNotice("Category deleted.");
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete category.",
      );
    }
  }

  const totalDownloads = adminApps.reduce((sum, app) => sum + app.downloads, 0);
  const publishedCount = adminApps.filter((app) => app.published).length;

  const filteredApps = useMemo(
    () =>
      adminApps.filter((app) => {
        const matchesSearch = `${app.name} ${app.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory =
          appCategoryFilter === "all" || app.category === appCategoryFilter;
        const matchesStatus =
          appStatusFilter === "all" ||
          (appStatusFilter === "published" ? app.published : !app.published);

        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [adminApps, search, appCategoryFilter, appStatusFilter],
  );

  // Login screen
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fc] px-5 py-10">
        <div className="w-full max-w-[460px] rounded-[20px] border border-[#e3e9f4] bg-white px-7 py-9 shadow-[0_22px_65px_rgba(20,38,82,0.10)] sm:px-10 sm:py-10">
          <Link to="/" className="inline-flex items-center" aria-label="AppNook home">
            <img
              src="/AppNook-logo.png"
              alt="AppNook"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <p className="mt-7 text-[13px] font-semibold tracking-[0.08em] text-[#075cff]">
            RESTRICTED ACCESS
          </p>
          <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#101a3d]">
            Admin login
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-[#536184]">
            Sign in to manage your AppNook library.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-10">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#354365]">
                Admin password
              </span>
              <div className="flex gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your admin password"
                  className="h-12 min-w-0 flex-1 rounded-2xl border border-[#dce4f2] bg-white px-4 text-sm text-[#101a3d] outline-none transition placeholder:text-[#858b98] focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dce4f2] text-[#172344] transition hover:border-[#b9c9e5] hover:bg-[#f8faff] focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-5 flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#075cff] px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>

          <Link
            to="/"
            className="mt-5 block text-center text-sm font-medium text-[#172344] transition hover:text-[#075cff]"
          >
            <ArrowLeft size={15} className="mr-1 inline" /> Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-[#101a3d]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[264px] shrink-0 border-r border-[#e5ebf5] bg-white px-4 py-7 md:flex md:flex-col">
          <Link to="/" className="mb-7 flex flex-col items-start gap-2 px-1" aria-label="AppNook home">
            <img
              src="/AppNook-logo.png"
              alt="AppNook"
              className="h-9 w-auto max-w-[150px] object-contain object-left"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Admin panel
            </span>
          </Link>

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-[#687797]">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setSection(item.label);
                    setNotice("");
                    setError("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    section === item.label
                      ? "bg-[#eaf1ff] text-[#075cff]"
                      : "text-[#34415f] hover:bg-[#f5f7fc] hover:text-[#101a3d]"
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[20px] border border-[#e1e8f4] bg-[#f8faff] p-4">
            <p className="text-sm font-bold text-[#101a3d]">AppNook workspace</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Connected to your Cloudflare database.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-indigo-600"
            >
              <ArrowLeft size={14} /> View public site
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-[#e5ebf5] bg-white px-5 sm:px-10">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white md:hidden"
              >
                <Smartphone size={18} />
              </Link>
              <div>
                <p className="text-sm font-bold">Admin Panel</p>
                <p className="text-xs text-zinc-400">
                  Manage your application library
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadDashboard()}
                className="rounded-full border border-[#dce4f2] px-4 py-2.5 text-xs font-semibold text-[#172344] transition hover:bg-[#f8faff]"
              >
                Refresh
              </button>
              <button
                onClick={logout}
                className="rounded-full border border-[#ffd3cf] px-4 py-2.5 text-xs font-semibold text-[#d92d20] transition hover:bg-[#fff6f5]"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="border-b border-zinc-200 bg-white px-3 py-2 md:hidden">
            <nav className="flex gap-1 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => setSection(item.label)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                      section === item.label
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <main className="mx-auto max-w-[1600px] p-5 sm:p-7 lg:px-10 lg:py-9">
            {error && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{error}</span>
                <button onClick={() => setError("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            {notice && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <span className="flex items-center gap-2">
                  <Check size={16} />
                  {notice}
                </span>
                <button onClick={() => setNotice("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            {loading && (
              <p className="mb-5 text-sm text-zinc-500">
                Loading database records...
              </p>
            )}

            {section === "Dashboard" && (
              <>
                <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[13px] font-semibold tracking-[0.08em] text-[#075cff]">
                      OVERVIEW
                    </p>
                    <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-[-0.035em] text-[#101a3d]">
                      Dashboard
                    </h1>
                    <p className="mt-2 text-[15px] text-[#536184]">
                      Here's what's happening with your app library.
                    </p>
                  </div>
                  <button
                    onClick={openAddForm}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#075cff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <Plus size={17} /> Add application
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    {
                      label: "Total apps",
                      value: adminApps.length.toLocaleString(),
                      note: "",
                      icon: Package,
                    },
                    {
                      label: "Published apps",
                      value: publishedCount.toLocaleString(),
                      note: "",
                      icon: Eye,
                    },
                    {
                      label: "Downloads",
                      value: totalDownloads.toLocaleString(),
                      note: "All time",
                      icon: Download,
                    },
                    {
                      label: "Visitors",
                      value: "—",
                      note: "Analytics not connected",
                      icon: LayoutDashboard,
                    },
                    {
                      label: "Unread messages",
                      value: "—",
                      note: "Inbox not connected",
                      icon: MessageCircle,
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="min-h-[154px] rounded-[20px] border border-[#e1e8f4] bg-white px-6 py-6 transition hover:border-[#cbd8ee]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[#536184]">
                            {stat.label}
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f5ff] text-[#075cff]">
                            <Icon size={16} />
                          </span>
                        </div>
                        <p className="mt-4 text-[38px] font-bold leading-none tracking-[-0.04em] text-[#101a3d]">
                          {stat.value}
                        </p>
                        {stat.note && (
                          <p className="mt-2 text-xs text-[#687797]">
                            {stat.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
                  <section className="overflow-hidden rounded-[20px] border border-[#e1e8f4] bg-white">
                    <div className="flex items-center justify-between border-b border-[#edf1f7] px-6 py-5">
                      <div>
                        <h2 className="text-[18px] font-semibold text-[#101a3d]">
                          Recent applications
                        </h2>
                        <p className="mt-1 text-sm text-[#687797]">
                          Your latest listings
                        </p>
                      </div>
                      <button
                        onClick={() => setSection("Apps")}
                        className="text-sm font-semibold text-[#075cff] hover:text-blue-700"
                      >
                        View all
                      </button>
                    </div>

                    <div className="divide-y divide-[#edf1f7]">
                      {adminApps.slice(0, 5).map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center gap-4 px-6 py-4"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#075cff] text-sm font-bold text-white">
                            {app.icon.slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#101a3d]">
                              {app.name}
                            </p>
                            <p className="mt-1 text-xs text-[#687797]">
                              {app.size}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                              app.published
                                ? "bg-[#e5f7ed] text-[#16834b]"
                                : "bg-[#f0f2f6] text-[#687797]"
                            }`}
                          >
                            {app.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      ))}
                      {adminApps.length === 0 && (
                        <div className="px-6 py-12 text-center">
                          <Package size={25} className="mx-auto text-[#a4afc3]" />
                          <p className="mt-3 text-sm font-medium text-[#34415f]">
                            No applications yet
                          </p>
                          <p className="mt-1 text-xs text-[#687797]">
                            Add your first app to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-[20px] border border-[#e1e8f4] bg-white">
                    <div className="flex items-center justify-between border-b border-[#edf1f7] px-6 py-5">
                      <div>
                        <h2 className="text-[18px] font-semibold text-[#101a3d]">
                          Latest messages
                        </h2>
                        <p className="mt-1 text-sm text-[#687797]">
                          From your contact page
                        </p>
                      </div>
                      <button
                        onClick={() => setSection("Messages")}
                        className="text-sm font-semibold text-[#075cff] hover:text-blue-700"
                      >
                        Open inbox
                      </button>
                    </div>
                    <div className="flex min-h-[158px] flex-col items-center justify-center px-6 py-8 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f5ff] text-[#075cff]">
                        <MessageCircle size={18} />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-[#34415f]">
                        Message inbox isn't connected yet
                      </p>
                      <p className="mt-1 max-w-[260px] text-xs leading-5 text-[#687797]">
                        Contact form messages will appear here once an inbox service is connected.
                      </p>
                    </div>
                  </section>
                </div>

                <section className="mt-6 rounded-[20px] border border-[#e1e8f4] bg-white p-6">
                  <h2 className="text-[18px] font-semibold text-[#101a3d]">
                    Downloads, last 30 days
                  </h2>
                  <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#dce5f3] bg-[#f8faff] px-5 py-8 text-center">
                    <p className="text-sm text-[#687797]">
                      A chart will appear here when daily download history is available.
                    </p>
                  </div>
                </section>
              </>
            )}

            {section === "Messages" && (
              <>
                <div className="mb-7">
                  <p className="text-[13px] font-semibold tracking-[0.08em] text-[#075cff]">
                    COMMUNICATION
                  </p>
                  <h1 className="mt-2 text-[34px] font-bold tracking-[-0.035em] text-[#101a3d]">
                    Messages
                  </h1>
                  <p className="mt-2 text-[15px] text-[#536184]">
                    Contact form enquiries and app requests.
                  </p>
                </div>
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[20px] border border-[#e1e8f4] bg-white px-6 py-12 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f5ff] text-[#075cff]">
                    <MessageCircle size={24} />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-[#101a3d]">
                    Inbox connection required
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#687797]">
                    The current contact forms are frontend previews and do not store or send messages. This section is ready for the inbox UI when message storage is implemented.
                  </p>
                </div>
              </>
            )}

            {section === "Apps" && (
              <>
                <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[13px] font-semibold tracking-[0.08em] text-[#075cff]">
                      LIBRARY
                    </p>
                    <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-[-0.035em] text-[#101a3d]">
                      Applications
                    </h1>
                    <p className="mt-2 text-[15px] text-[#536184]">
                      Manage your app listings.
                    </p>
                  </div>
                  <button
                    onClick={openAddForm}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#075cff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <Plus size={17} /> Add application
                  </button>
                </div>

                <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_200px_180px]">
                  <label className="flex h-[52px] min-w-0 items-center gap-3 rounded-2xl border border-[#dce4f2] bg-white px-4 transition focus-within:border-[#075cff] focus-within:ring-2 focus-within:ring-blue-100">
                    <Search size={18} className="shrink-0 text-[#7b88a3]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search applications..."
                      aria-label="Search applications"
                      className="w-full min-w-0 bg-transparent text-sm text-[#101a3d] outline-none placeholder:text-[#858fa5]"
                    />
                  </label>

                  <select
                    value={appCategoryFilter}
                    onChange={(event) => setAppCategoryFilter(event.target.value)}
                    aria-label="Filter by category"
                    className="h-[52px] w-full rounded-2xl border border-[#dce4f2] bg-white px-4 text-sm text-[#172344] outline-none transition focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All categories</option>
                    {adminCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={appStatusFilter}
                    onChange={(event) => setAppStatusFilter(event.target.value)}
                    aria-label="Filter by status"
                    className="h-[52px] w-full rounded-2xl border border-[#dce4f2] bg-white px-4 text-sm text-[#172344] outline-none transition focus:border-[#075cff] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="overflow-hidden rounded-[20px] border border-[#e1e8f4] bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left">
                      <thead className="bg-[#f8faff] text-[11px] font-bold uppercase tracking-[0.07em] text-[#687797]">
                        <tr>
                          <th className="px-6 py-4">Application</th>
                          <th className="px-4 py-4">Category</th>
                          <th className="px-4 py-4">Version</th>
                          <th className="px-4 py-4">Downloads</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4">Featured</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf1f7]">
                        {filteredApps.map((app) => (
                          <tr key={app.id} className="transition hover:bg-[#fbfcff]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#075cff] text-sm font-bold text-white">
                                  {app.icon.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#101a3d]">
                                    {app.name}
                                  </p>
                                  <p className="mt-1 text-xs text-[#687797]">
                                    {app.size}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-[#172344]">
                              {app.category}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#172344]">
                              {app.version}
                            </td>
                            <td className="px-4 py-4 text-sm text-[#172344]">
                              {app.downloads.toLocaleString()}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => void togglePublished(app)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  app.published
                                    ? "bg-[#e5f7ed] text-[#16834b]"
                                    : "bg-[#f0f2f6] text-[#687797]"
                                }`}
                              >
                                {app.published ? "Published" : "Draft"}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`text-sm font-medium ${
                                  app.featured ? "text-[#16834b]" : "text-[#687797]"
                                }`}
                              >
                                {app.featured ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditForm(app)}
                                  title="Edit app"
                                  aria-label={`Edit ${app.name}`}
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce4f2] text-[#536184] transition hover:border-[#b9c9e5] hover:bg-[#f0f5ff] hover:text-[#075cff]"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteApp(app)}
                                  title="Delete app"
                                  aria-label={`Delete ${app.name}`}
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ffd3cf] text-[#d92d20] transition hover:bg-[#fff6f5]"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredApps.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-14 text-center text-sm text-[#687797]"
                            >
                              No matching applications.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="mt-4 px-1 text-xs text-[#687797]">
                  {filteredApps.length} {filteredApps.length === 1 ? "application" : "applications"}
                </p>
              </>
            )}

            {section === "Categories" && (
              <>
                <div className="mb-7">
                  <p className="text-sm font-semibold text-indigo-600">
                    ORGANISATION
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold">Categories</h1>
                  <p className="mt-2 text-sm text-zinc-500">
                    Organise applications into categories.
                  </p>
                </div>

                <form
                  onSubmit={addCategory}
                  className="mb-6 flex max-w-xl gap-2"
                >
                  <input
                    required
                    value={categoryInput}
                    onChange={(event) => setCategoryInput(event.target.value)}
                    placeholder="New category name"
                    className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white">
                    <Plus size={16} /> Add
                  </button>
                </form>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {adminCategories.map((category, index) => (
                    <div
                      key={category}
                      className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${
                          [
                            "bg-indigo-600",
                            "bg-teal-600",
                            "bg-orange-500",
                            "bg-violet-600",
                            "bg-pink-600",
                            "bg-sky-600",
                          ][index % 6]
                        }`}
                      >
                        <Tags size={19} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{category}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {
                            adminApps.filter((app) => app.category === category)
                              .length
                          }{" "}
                          applications
                        </p>
                      </div>
                      <button
                        onClick={() => void removeCategory(category)}
                        title={`Delete ${category}`}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {section === "Settings" && (
              <>
                <div className="mb-7">
                  <p className="text-sm font-semibold text-indigo-600">
                    PREFERENCES
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold">Settings</h1>
                </div>
                <div className="max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
                  <h2 className="font-bold">Website information</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    AppNook — Apps worth keeping.
                  </p>
                  <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-800">
                    Your application listings and categories are now stored in
                    Cloudflare D1. Website settings will be connected
                    separately.
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 p-0 sm:items-center sm:p-5">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {editing ? "Update listing" : "New listing"}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {editing ? "Edit application" : "Add application"}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    App name *
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-400"
                    placeholder="e.g. Smart Practice"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    Description *
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full resize-y rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none focus:border-indigo-400"
                    placeholder="What does this app do?"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    Category *
                  </span>
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm outline-none"
                  >
                    {adminCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    Version *
                  </span>
                  <input
                    required
                    value={form.version}
                    onChange={(e) =>
                      setForm({ ...form, version: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none"
                    placeholder="1.0.0"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    App size
                  </span>
                  <input
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none"
                    placeholder="18 MB"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    Icon text or image URL
                  </span>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none"
                    placeholder="SP or public image URL"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    GitHub Release APK URL *
                  </span>
                  <input
                    required
                    type="url"
                    value={form.apkUrl}
                    onChange={(e) =>
                      setForm({ ...form, apkUrl: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none"
                    placeholder="https://github.com/owner/repo/releases/download/v1.0/app.apk"
                  />
                  <span className="mt-1 block text-xs text-zinc-400">
                    Upload the APK to a GitHub Release first, then paste its
                    download URL.
                  </span>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                    Features (comma separated)
                  </span>
                  <input
                    value={form.features}
                    onChange={(e) =>
                      setForm({ ...form, features: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none"
                    placeholder="Offline support, Easy to use, Fast"
                  />
                </label>

                <div className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-zinc-600">
                    Application screenshots
                  </span>

                  <div className="rounded-xl border border-dashed border-zinc-300 p-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-indigo-50 px-4 py-6 text-center transition hover:bg-indigo-100">
                      <Plus size={24} className="text-indigo-600" />

                      <span className="text-sm font-semibold text-indigo-700">
                        {screenshotUploading
                          ? "Uploading screenshots..."
                          : "Choose screenshot images"}
                      </span>

                      <span className="text-xs text-zinc-500">
                        PNG, JPG or WebP · Maximum 5 MB per image
                      </span>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        disabled={screenshotUploading}
                        className="hidden"
                        onChange={(event) => {
                          void uploadScreenshots(event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>

                    <p className="mt-3 text-xs text-zinc-500">
                      Uploaded images will be added to your application when you
                      save it.
                    </p>

                    <label className="mt-4 block">
                      <span className="mb-1.5 block text-xs font-semibold text-zinc-600">
                        Screenshot image URLs (optional fallback)
                      </span>

                      <textarea
                        rows={3}
                        value={form.screenshots}
                        onChange={(e) =>
                          setForm({ ...form, screenshots: e.target.value })
                        }
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-3 text-sm outline-none"
                        placeholder="https://example.com/screenshot1.png, https://example.com/screenshot2.png"
                      />
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  Featured application
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm({ ...form, published: e.target.checked })
                    }
                  />
                  Publish immediately
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveApp()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  <Save size={16} />{" "}
                  {editing ? "Save changes" : "Add application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const location = useLocation();

  const [apps, setApps] = useState<(AppItem & PublicApp)[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPublicData() {
      setLoading(true);
      setError("");

      try {
        const [appsData, categoriesData] = await Promise.all([
          fetchPublicApps(),
          fetchPublicCategories(),
        ]);

        if (!active) return;

        setApps(appsData);
        setCategories(categoriesData.map((item) => item.name));
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "Unable to load applications.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPublicData();

    return () => {
      active = false;
    };
  }, []);

  if (
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/")
  ) {
    return <AdminPanel />;
  }

  return (
    <PublicDataContext.Provider value={{ apps, categories, loading, error }}>
      <div className="flex min-h-screen flex-col bg-white pt-[72px] text-[#101a3d]">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/app/:slug" element={<AppDetails />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/privacy"
            element={
              <SimplePage
                title="Privacy policy"
                description="AppNook aims to collect only the information necessary to operate the platform. More detailed privacy information will be published before public launch."
              />
            }
          />
          <Route
            path="/terms"
            element={
              <SimplePage
                title="Terms & disclaimer"
                description="Only download applications you trust. Applications distributed through AppNook are provided by their respective publishers. Users should verify the source and compatibility before installation."
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </PublicDataContext.Provider>
  );
}
