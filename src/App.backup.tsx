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
  Save,
  ArrowLeft,
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
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Smartphone size={22} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            App<span className="text-indigo-600">Nook</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? "text-indigo-600" : "text-zinc-500 hover:text-zinc-900"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/apps"
            className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-200"
          >
            <Search size={16} /> Find apps
          </Link>
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
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link to="/" className="text-xl font-extrabold">
            App<span className="text-indigo-600">Nook</span>
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
      className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5"
    >
      <div className="flex items-start gap-3">
        <AppIcon app={app} />
        <div className="min-w-0 flex-1">
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
  const featured = apps.filter((app) => app.featured);
  const popular = [...apps].sort((a, b) => b.downloads - a.downloads);
  const [query, setQuery] = useState("");

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-20 text-center">
        <p className="text-sm text-zinc-500">Loading applications...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-20 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#f4f3ff]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-indigo-700">
              <Sparkles size={14} /> A better place to discover apps
            </div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-6xl">
              Discover apps that make{" "}
              <span className="text-indigo-600">life easier.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-600">
              Explore useful applications, discover new tools, and download them
              directly. Everything you need, all in one nook.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/apps?q=${encodeURIComponent(query)}`;
              }}
              className="mt-8 flex max-w-lg items-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg shadow-indigo-900/5"
            >
              <Search className="ml-3 shrink-0 text-zinc-400" size={20} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search applications..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
              />
              <button className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                Search
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-5 text-xs font-medium text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} /> Direct downloads
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={15} /> Simple experience
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone size={15} /> Android apps
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-md rounded-[32px] border border-white bg-white p-6 shadow-2xl shadow-indigo-900/10">
              <div className="flex items-center justify-between">
                <span className="font-bold">Explore applications</span>
                <Grid2X2 size={19} className="text-indigo-600" />
              </div>
              <div className="mt-6 space-y-4">
                {featured.slice(0, 3).map((app) => (
                  <Link
                    to={`/app/${app.slug}`}
                    key={app.id}
                    className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 hover:bg-indigo-50"
                  >
                    <AppIcon app={app} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{app.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {app.category}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-zinc-400" />
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-indigo-600 p-4 text-white">
                <span className="text-sm font-semibold">
                  Find your next favourite app
                </span>
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-5 py-16 lg:px-8">
        <section>
          <SectionHeading
            title="Featured applications"
            subtitle="Handpicked applications worth exploring."
            link="/apps"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Browse categories"
            subtitle="Find the right application for your needs."
            link="/categories"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/apps?category=${encodeURIComponent(category)}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white ${["bg-indigo-600", "bg-teal-600", "bg-orange-500", "bg-violet-600", "bg-pink-600", "bg-sky-600"][index]}`}
                >
                  <Grid2X2 size={19} />
                </div>
                <p className="text-sm font-semibold">{category}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {apps.filter((a) => a.category === category).length} apps
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Popular applications"
            subtitle="Applications people are exploring."
            link="/apps"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.slice(0, 3).map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-zinc-900 px-7 py-10 text-white sm:px-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold">
                Your next useful app is here.
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Explore the complete AppNook collection.
              </p>
            </div>
            <Link
              to="/apps"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-900 hover:bg-indigo-50"
            >
              Explore all apps <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function AppsPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("newest");

  const { apps, categories } = usePublicData();

  const filtered = useMemo(() => {
    let result = apps.filter((app) => {
      const matchesQuery = `${app.name} ${app.description} ${app.category}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "All" || app.category === category;
      return matchesQuery && matchesCategory;
    });

    if (sort === "popular")
      result = [...result].sort((a, b) => b.downloads - a.downloads);
    if (sort === "alphabetical")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [apps, query, category, sort]);

  return (
    <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-12 lg:px-8">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold text-indigo-600">
          APPLICATION LIBRARY
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Explore applications
        </h1>
        <p className="mt-3 text-zinc-500">
          Discover useful tools and applications in one place.
        </p>
      </div>

      <div className="mb-7 flex flex-col gap-3 md:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4">
          <Search size={19} className="text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description or category..."
            className="w-full py-3.5 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3">
          <SlidersHorizontal size={17} className="text-zinc-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent py-3.5 text-sm outline-none"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most popular</option>
            <option value="alphabetical">A to Z</option>
          </select>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {["All", ...categories].map((item) => (
          <button
            key={item}
            onClick={() => {
              setCategory(item);
              setParams(item === "All" ? {} : { category: item });
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-indigo-600 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="mb-5 text-sm text-zinc-500">
        {filtered.length} applications found
      </p>
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
          <Search className="mx-auto text-zinc-300" size={32} />
          <h3 className="mt-4 font-bold">No applications found</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Try another search or category.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
              setParams({});
            }}
            className="mt-5 text-sm font-semibold text-indigo-600"
          >
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
}

function CategoriesPage() {
  const { apps, categories } = usePublicData();

  return (
    <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-12 lg:px-8">
      <h1 className="text-3xl font-extrabold">Browse categories</h1>
      <p className="mt-3 text-zinc-500">
        Explore applications by their purpose.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            key={category}
            to={`/apps?category=${encodeURIComponent(category)}`}
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
          >
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-white ${["bg-indigo-600", "bg-teal-600", "bg-orange-500", "bg-violet-600", "bg-pink-600", "bg-sky-600"][index]}`}
            >
              <Grid2X2 size={22} />
            </div>
            <h2 className="font-bold">{category}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {apps.filter((a) => a.category === category).length} applications
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function AppDetails() {
  const { apps } = usePublicData();
  const { slug } = useParams();
  const app = apps.find((item) => item.slug === slug);

  if (!app) return <NotFound />;

  return (
    <main className="mx-auto min-h-[60vh] max-w-5xl px-5 py-12">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <AppIcon app={app} size="large" />
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">{app.name}</h1>
            <p className="mt-2 text-sm text-zinc-500">{app.description}</p>
            <p className="mt-3 text-xs font-semibold text-indigo-600">
              {app.category}
            </p>
          </div>
          <a
            href={getDownloadUrl(app.slug)}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Download APK
          </a>
        </div>

        <div className="my-9 grid grid-cols-3 gap-3 border-y border-zinc-100 py-6 text-center">
          <div>
            <p className="font-bold">{app.version}</p>
            <p className="mt-1 text-xs text-zinc-400">Version</p>
          </div>
          <div>
            <p className="font-bold">{app.size}</p>
            <p className="mt-1 text-xs text-zinc-400">App size</p>
          </div>
          <div>
            <p className="font-bold">{app.downloads.toLocaleString()}</p>
            <p className="mt-1 text-xs text-zinc-400">Downloads</p>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold">About this app</h2>
          <p className="mt-3 leading-7 text-zinc-600">{app.description}</p>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-bold">Key features</h2>
          <ul className="mt-4 space-y-3">
            {app.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-zinc-600"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Zap size={13} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </section>
        {app.screenshots.length > 0 && (
          <section className="mt-9">
            <h2 className="text-xl font-bold">App screenshots</h2>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {app.screenshots.map((screenshot, index) => (
                <a
                  key={`${screenshot}-${index}`}
                  href={screenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                >
                  <img
                    src={screenshot}
                    alt={`${app.name} screenshot ${index + 1}`}
                    loading="lazy"
                    className="h-auto w-full object-cover transition hover:scale-[1.02]"
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
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

type AdminSection = "Dashboard" | "Apps" | "Categories" | "Settings";

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
  useEffect(() => {
    console.log("DEBUG: AdminPanel mounted");

    return () => {
      console.log("DEBUG: AdminPanel unmounted");
    };
  }, []);
  const [token, setToken] = useState(
    () => sessionStorage.getItem("appnook_admin_token") || "",
  );
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [adminApps, setAdminApps] = useState<AdminApp[]>([]);
  const [adminCategories, setAdminCategories] = useState<string[]>([]);

  const [section, setSection] = useState<AdminSection>("Dashboard");
  const [search, setSearch] = useState("");
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
      adminApps.filter((app) =>
        `${app.name} ${app.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [adminApps, search],
  );

  // Login screen
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-5">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-xl shadow-indigo-950/5 sm:p-9">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Smartphone size={24} />
            </span>
            <span className="text-2xl font-extrabold">
              App<span className="text-indigo-600">Nook</span>
            </span>
          </Link>

          <p className="mt-9 text-sm font-semibold text-indigo-600">
            RESTRICTED ACCESS
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Admin login</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Sign in to manage your AppNook application library.
          </p>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700">
                Admin password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your admin password"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <button
              disabled={loginLoading}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loginLoading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>

          <Link
            to="/"
            className="mt-6 block text-center text-sm font-medium text-zinc-500 hover:text-indigo-600"
          >
            <ArrowLeft size={15} className="mr-1 inline" /> Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-5 md:flex md:flex-col">
          <Link to="/" className="mb-10 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Smartphone size={21} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              App<span className="text-indigo-600">Nook</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Admin panel
              </span>
            </span>
          </Link>

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
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
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-bold">AppNook workspace</p>
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
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-7">
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
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Refresh
              </button>
              <button
                onClick={logout}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
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

          <main className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-9">
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
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-sm font-semibold text-indigo-600">
                      OVERVIEW
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                      Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                      Here's what's happening with your app library.
                    </p>
                  </div>
                  <button
                    onClick={openAddForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    <Plus size={17} /> Add application
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      label: "Total Apps",
                      value: adminApps.length,
                      icon: Package,
                    },
                    {
                      label: "Published Apps",
                      value: publishedCount,
                      icon: Eye,
                    },
                    {
                      label: "Download Requests",
                      value: totalDownloads.toLocaleString(),
                      icon: Download,
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-zinc-200 bg-white p-5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-500">
                            {stat.label}
                          </span>
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Icon size={19} />
                          </span>
                        </div>
                        <p className="mt-5 text-3xl font-extrabold tracking-tight">
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <section className="mt-9 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                    <div>
                      <h2 className="font-bold">Recent applications</h2>
                      <p className="mt-1 text-xs text-zinc-400">
                        Your latest app listings
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("Apps")}
                      className="text-sm font-semibold text-indigo-600"
                    >
                      View all
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {adminApps.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-3 px-5 py-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white">
                          {app.icon.slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {app.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {app.category} · v{app.version}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            app.published
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {app.published ? "Published" : "Draft"}
                        </span>
                      </div>
                    ))}
                    {adminApps.length === 0 && (
                      <p className="p-8 text-center text-sm text-zinc-400">
                        No applications yet. Add your first app.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            {section === "Apps" && (
              <>
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-sm font-semibold text-indigo-600">
                      LIBRARY
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold">
                      Applications
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                      Manage your app listings.
                    </p>
                  </div>
                  <button
                    onClick={openAddForm}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white"
                  >
                    <Plus size={17} /> Add application
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4">
                  <Search size={17} className="text-zinc-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search applications..."
                    className="w-full py-3 text-sm outline-none"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                      <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-400">
                        <tr>
                          <th className="px-5 py-4">Application</th>
                          <th className="px-4 py-4">Category</th>
                          <th className="px-4 py-4">Version</th>
                          <th className="px-4 py-4">Downloads</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredApps.map((app) => (
                          <tr key={app.id} className="hover:bg-zinc-50/70">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white">
                                  {app.icon.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">
                                    {app.name}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    {app.size}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-zinc-500">
                              {app.category}
                            </td>
                            <td className="px-4 py-4 text-sm text-zinc-500">
                              {app.version}
                            </td>
                            <td className="px-4 py-4 text-sm text-zinc-500">
                              {app.downloads.toLocaleString()}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => void togglePublished(app)}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                  app.published
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-zinc-100 text-zinc-500"
                                }`}
                              >
                                {app.published ? "Published" : "Draft"}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => openEditForm(app)}
                                  title="Edit app"
                                  className="rounded-lg p-2 text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => void deleteApp(app)}
                                  title="Delete app"
                                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600"
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
                              colSpan={6}
                              className="px-5 py-12 text-center text-sm text-zinc-400"
                            >
                              No matching applications.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
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
      <>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/app/:slug" element={<AppDetails />} />
          <Route
            path="/about"
            element={
              <SimplePage
                title="About AppNook"
                description="AppNook is an independent platform for discovering useful Android applications. Our goal is to make finding and downloading applications simple and accessible."
              />
            }
          />
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
      </>
    </PublicDataContext.Provider>
  );
}