"use client";

import {
  Bell,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Coins,
  Download,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Search,
  Settings,
  UserRound,
  WalletCards,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Role =
  | "Super Admin"
  | "Admin Ranting"
  | "Petugas Lapangan"
  | "Bendahara"
  | "Viewer Publik";

type House = {
  id: number;
  name: string;
  phone: string;
  address: string;
  rtRw: string;
  village: string;
  active: boolean;
  joinedAt: string;
  boxNumber: string;
};

type CoinBox = {
  id: number;
  boxNumber: string;
  status: "Active" | "Lost" | "Damaged" | "Inactive";
  houseId: number;
  distributedAt: string;
};

type Withdrawal = {
  id: number;
  boxNumber: string;
  houseName: string;
  amount: number;
  collector: string;
  status: "Pending" | "Validated" | "Rejected";
  notes: string;
  createdAt: string;
};

type DashboardStats = {
  activeHouses: number;
  activeBoxes: number;
  income: number;
  pending: number;
  balance: number;
};

type Account = { id?: number; role: Role; name: string; email: string };

const accounts: Account[] = [
  { role: "Super Admin", name: "Admin Pusat", email: "superadmin@koinnu.local" },
  { role: "Admin Ranting", name: "Admin Ranting", email: "admin@ranting.local" },
  { role: "Petugas Lapangan", name: "Petugas A", email: "petugas@ranting.local" },
  { role: "Bendahara", name: "Bendahara", email: "bendahara@ranting.local" },
  { role: "Viewer Publik", name: "Viewer Publik", email: "publik@koinnu.local" }
];

const initialHouses: House[] = [
  {
    id: 1,
    name: "Keluarga H. Mahfudz",
    phone: "081234567890",
    address: "Jl. Masjid RT 01 RW 02",
    rtRw: "RT01/RW02",
    village: "Pakiskembar",
    active: true,
    joinedAt: "2026-01-08",
    boxNumber: "KNU-RT01-001"
  },
  {
    id: 2,
    name: "Keluarga Ibu Aminah",
    phone: "082223334444",
    address: "Jl. Pesantren RT 02 RW 02",
    rtRw: "RT02/RW02",
    village: "Pakiskembar",
    active: true,
    joinedAt: "2026-01-11",
    boxNumber: "KNU-RT02-014"
  },
  {
    id: 3,
    name: "Keluarga Pak Zainuri",
    phone: "085655551111",
    address: "Jl. Makam RT 03 RW 01",
    rtRw: "RT03/RW01",
    village: "Pakiskembar",
    active: false,
    joinedAt: "2025-12-20",
    boxNumber: "KNU-RT03-006"
  },
  {
    id: 4,
    name: "Keluarga Bu Siti",
    phone: "081999223344",
    address: "Jl. Langgar RT 01 RW 01",
    rtRw: "RT01/RW01",
    village: "Pakiskembar",
    active: true,
    joinedAt: "2026-02-03",
    boxNumber: "KNU-RT01-021"
  }
];

const initialBoxes: CoinBox[] = [
  { id: 1, boxNumber: "KNU-RT01-001", status: "Active", houseId: 1, distributedAt: "2026-01-08" },
  { id: 2, boxNumber: "KNU-RT02-014", status: "Active", houseId: 2, distributedAt: "2026-01-11" },
  { id: 3, boxNumber: "KNU-RT03-006", status: "Inactive", houseId: 3, distributedAt: "2025-12-20" },
  { id: 4, boxNumber: "KNU-RT01-021", status: "Damaged", houseId: 4, distributedAt: "2026-02-03" }
];

const initialWithdrawals: Withdrawal[] = [
  {
    id: 1,
    boxNumber: "KNU-RT01-001",
    houseName: "Keluarga H. Mahfudz",
    amount: 127500,
    collector: "Petugas A",
    status: "Validated",
    notes: "Setoran rutin bulan Mei",
    createdAt: "2026-05-03 09:12"
  },
  {
    id: 2,
    boxNumber: "KNU-RT02-014",
    houseName: "Keluarga Ibu Aminah",
    amount: 85000,
    collector: "Petugas B",
    status: "Pending",
    notes: "Menunggu hitung ulang bendahara",
    createdAt: "2026-05-15 16:30"
  },
  {
    id: 3,
    boxNumber: "KNU-RT01-021",
    houseName: "Keluarga Bu Siti",
    amount: 42000,
    collector: "Petugas A",
    status: "Rejected",
    notes: "Kaleng rusak, perlu klarifikasi",
    createdAt: "2026-05-16 10:05"
  }
];

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

const navigation: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Admin Ranting", "Petugas Lapangan", "Bendahara"] },
  { key: "houses", href: "/houses", label: "Rumah", icon: Home, roles: ["Super Admin", "Admin Ranting"] },
  { key: "coin-boxes", href: "/coin-boxes", label: "Kaleng", icon: Boxes, roles: ["Super Admin", "Admin Ranting", "Petugas Lapangan"] },
  { key: "withdrawals", href: "/withdrawals", label: "Penarikan", icon: QrCode, roles: ["Super Admin", "Admin Ranting", "Petugas Lapangan", "Bendahara"] },
  { key: "finance", href: "/finance", label: "Keuangan", icon: WalletCards, roles: ["Super Admin", "Admin Ranting", "Bendahara"] },
  { key: "reports", href: "/reports", label: "Laporan", icon: FileText, roles: ["Super Admin", "Admin Ranting", "Bendahara"] },
  { key: "settings", href: "/settings", label: "Pengaturan", icon: Settings, roles: ["Super Admin"] },
  { key: "audit-logs", href: "/audit-logs", label: "Audit Logs", icon: ClipboardList, roles: ["Super Admin"] }
];

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

export type InternalPage =
  | "dashboard"
  | "houses"
  | "coin-boxes"
  | "withdrawals"
  | "finance"
  | "reports"
  | "settings"
  | "audit-logs";

export function InternalApp({ initialPage, initialUser }: { initialPage: InternalPage; initialUser: Account }) {
  const router = useRouter();
  const [account] = useState<Account>(initialUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [houses, setHouses] = useState(initialHouses);
  const [boxes] = useState(initialBoxes);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [searchTerm, setSearchTerm] = useState("");
  const [rtFilter, setRtFilter] = useState("Semua");
  const [newHouseName, setNewHouseName] = useState("");
  const [selectedBox, setSelectedBox] = useState(initialBoxes[0].boxNumber);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalNotes, setWithdrawalNotes] = useState("");

  const availableNav = navigation.filter((item) => item.roles.includes(account.role));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const stats = useMemo(() => {
    const validated = withdrawals.filter((item) => item.status === "Validated");
    const income = validated.reduce((sum, item) => sum + item.amount, 0);
    const pending = withdrawals.filter((item) => item.status === "Pending").length;
    return {
      activeHouses: houses.filter((item) => item.active).length,
      activeBoxes: boxes.filter((item) => item.status === "Active").length,
      income,
      pending,
      balance: income - 285000
    };
  }, [boxes, houses, withdrawals]);

  const filteredHouses = houses.filter((house) => {
    const matchesSearch = `${house.name} ${house.phone} ${house.address} ${house.boxNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRt = rtFilter === "Semua" || house.rtRw === rtFilter;
    return matchesSearch && matchesRt;
  });

  const selectedHouse = houses.find((house) => house.boxNumber === selectedBox);

  function addHouse() {
    if (!newHouseName.trim()) return;
    const nextId = houses.length + 1;
    const nextBox = `KNU-RT01-${String(nextId + 30).padStart(3, "0")}`;
    setHouses((items) => [
      {
        id: nextId,
        name: newHouseName.trim(),
        phone: "08xxxxxxxxxx",
        address: "Alamat baru",
        rtRw: "RT01/RW02",
        village: "Pakiskembar",
        active: true,
        joinedAt: "2026-05-18",
        boxNumber: nextBox
      },
      ...items
    ]);
    setNewHouseName("");
  }

  function submitWithdrawal() {
    const amount = Number(withdrawalAmount);
    if (!selectedHouse || !Number.isFinite(amount) || amount <= 0) return;
    setWithdrawals((items) => [
      {
        id: items.length + 1,
        boxNumber: selectedBox,
        houseName: selectedHouse.name,
        amount,
        collector: account.name,
        status: "Pending",
        notes: withdrawalNotes || "Setoran baru",
        createdAt: "2026-05-18 22:40"
      },
      ...items
    ]);
    setWithdrawalAmount("");
    setWithdrawalNotes("");
  }

  function updateWithdrawal(id: number, status: Withdrawal["status"]) {
    setWithdrawals((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[280px] border-r border-slate-200 bg-white p-4 transition lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">KOINNU</p>
            <h1 className="text-lg font-bold text-ink">Ranting System</h1>
          </div>
          <button
            className="rounded-[6px] p-2 text-slate-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-8 grid gap-2">
          {availableNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-[8px] px-3 py-3 text-left text-sm font-medium transition ${
                  initialPage === item.key
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-[8px] border border-slate-200 bg-paper p-4">
          <p className="text-sm font-semibold text-ink">{account.name}</p>
          <p className="mt-1 text-xs text-slate-500">{account.role}</p>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            onClick={logout}
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-[6px] border border-slate-200 bg-white p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                LAZISNU Pakiskembar
              </p>
              <h2 className="text-lg font-semibold text-ink">{pageTitle(initialPage)}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-[6px] border border-slate-200 bg-white p-2 text-slate-600" aria-label="Notifikasi">
              <Bell size={18} />
            </button>
            <div className="hidden items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm md:flex">
              <UserRound size={16} className="text-brand-600" />
              {account.role}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {initialPage === "dashboard" && <Dashboard stats={stats} withdrawals={withdrawals} />}
          {initialPage === "houses" && (
            <HousesView
              houses={filteredHouses}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              rtFilter={rtFilter}
              setRtFilter={setRtFilter}
              newHouseName={newHouseName}
              setNewHouseName={setNewHouseName}
              addHouse={addHouse}
            />
          )}
          {initialPage === "coin-boxes" && <BoxesView boxes={boxes} houses={houses} />}
          {initialPage === "withdrawals" && (
            <WithdrawalsView
              account={account}
              boxes={boxes}
              selectedBox={selectedBox}
              setSelectedBox={setSelectedBox}
              selectedHouse={selectedHouse}
              amount={withdrawalAmount}
              setAmount={setWithdrawalAmount}
              notes={withdrawalNotes}
              setNotes={setWithdrawalNotes}
              submitWithdrawal={submitWithdrawal}
              withdrawals={withdrawals}
              updateWithdrawal={updateWithdrawal}
            />
          )}
          {initialPage === "finance" && (
            <FinanceView stats={stats} withdrawals={withdrawals} updateWithdrawal={updateWithdrawal} />
          )}
          {initialPage === "reports" && <ReportsView stats={stats} withdrawals={withdrawals} />}
          {initialPage === "settings" && <SettingsView />}
          {initialPage === "audit-logs" && <AuditLogsView account={account} withdrawals={withdrawals} />}
        </div>
      </section>
    </main>
  );
}

function pageTitle(page: string) {
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    houses: "Manajemen Rumah",
    "coin-boxes": "Manajemen Kaleng",
    withdrawals: "Penarikan Koin",
    finance: "Keuangan",
    reports: "Laporan",
    settings: "Pengaturan",
    "audit-logs": "Audit Logs"
  };
  return titles[page] ?? "Dashboard";
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "light" }) {
  return (
    <div className={`rounded-[8px] border p-4 ${tone === "light" ? "border-white/20 bg-white/10" : "border-slate-200 bg-white"}`}>
      <p className={`text-xs ${tone === "light" ? "text-brand-50" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-2 text-xl font-semibold ${tone === "light" ? "text-white" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function Dashboard({ stats, withdrawals }: { stats: DashboardStats; withdrawals: Withdrawal[] }) {
  const recent = withdrawals.slice(0, 4);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Home} label="Rumah aktif" value={String(stats.activeHouses)} />
        <StatCard icon={Boxes} label="Kaleng aktif" value={String(stats.activeBoxes)} />
        <StatCard icon={Coins} label="Pemasukan bulan ini" value={currency.format(stats.income)} />
        <StatCard icon={ClipboardList} label="Menunggu validasi" value={String(stats.pending)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Grafik pemasukan">
          <div className="flex h-64 items-end gap-3">
            {[38, 56, 44, 72, 64, 86].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-[6px] bg-brand-500" style={{ height: `${height}%` }} />
                <span className="text-xs text-slate-500">M{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Wilayah terbaik">
          <div className="grid gap-3">
            {["RT01/RW02", "RT02/RW02", "RT01/RW01"].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-[8px] bg-paper p-3">
                <span className="font-medium text-ink">{item}</span>
                <span className="text-sm text-brand-700">#{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Transaksi terbaru">
        <DataTable
          headers={["Kaleng", "Rumah", "Nominal", "Status"]}
          rows={recent.map((item) => [item.boxNumber, item.houseName, currency.format(item.amount), item.status])}
        />
      </Panel>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className="rounded-[8px] bg-brand-50 p-3 text-brand-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function HousesView(props: {
  houses: House[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  rtFilter: string;
  setRtFilter: (value: string) => void;
  newHouseName: string;
  setNewHouseName: (value: string) => void;
  addHouse: () => void;
}) {
  return (
    <div className="grid gap-6">
      <Panel title="Tambah rumah">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="h-11 rounded-[8px] border border-slate-200 px-3"
            placeholder="Nama kepala keluarga"
            value={props.newHouseName}
            onChange={(event) => props.setNewHouseName(event.target.value)}
          />
          <button className="h-11 rounded-[8px] bg-brand-600 px-4 font-semibold text-white" onClick={props.addHouse}>
            Tambah
          </button>
        </div>
      </Panel>
      <Panel title="Data rumah donatur">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              className="h-11 w-full rounded-[8px] border border-slate-200 pl-10 pr-3"
              placeholder="Cari nama, alamat, HP, atau nomor kaleng"
              value={props.searchTerm}
              onChange={(event) => props.setSearchTerm(event.target.value)}
            />
          </label>
          <select
            className="h-11 rounded-[8px] border border-slate-200 px-3"
            value={props.rtFilter}
            onChange={(event) => props.setRtFilter(event.target.value)}
          >
            {["Semua", "RT01/RW02", "RT02/RW02", "RT03/RW01", "RT01/RW01"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <DataTable
          headers={["Nama", "RT/RW", "HP", "Kaleng", "Status"]}
          rows={props.houses.map((item) => [
            item.name,
            item.rtRw,
            item.phone,
            item.boxNumber,
            item.active ? "Aktif" : "Nonaktif"
          ])}
        />
      </Panel>
    </div>
  );
}

function BoxesView({ boxes, houses }: { boxes: CoinBox[]; houses: House[] }) {
  return (
    <Panel title="Tracking kaleng KOIN NU">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => {
          const house = houses.find((item) => item.id === box.houseId);
          return (
            <div key={box.id} className="rounded-[8px] border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{box.boxNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">{house?.name ?? "Belum terhubung"}</p>
                </div>
                <StatusBadge status={box.status} />
              </div>
              <div className="mt-4 flex aspect-square items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-paper">
                <QrCode size={72} className="text-brand-700" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Distribusi: {box.distributedAt}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function WithdrawalsView(props: {
  account: { role: Role; name: string };
  boxes: CoinBox[];
  selectedBox: string;
  setSelectedBox: (value: string) => void;
  selectedHouse?: House;
  amount: string;
  setAmount: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  submitWithdrawal: () => void;
  withdrawals: Withdrawal[];
  updateWithdrawal: (id: number, status: Withdrawal["status"]) => void;
}) {
  const canValidate = ["Super Admin", "Admin Ranting", "Bendahara"].includes(props.account.role);
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Input penarikan">
        <div className="grid gap-4">
          <select
            className="h-11 rounded-[8px] border border-slate-200 px-3"
            value={props.selectedBox}
            onChange={(event) => props.setSelectedBox(event.target.value)}
          >
            {props.boxes.map((box) => (
              <option key={box.id} value={box.boxNumber}>
                {box.boxNumber} - {box.status}
              </option>
            ))}
          </select>
          <div className="rounded-[8px] bg-paper p-4">
            <p className="text-sm text-slate-500">Rumah terhubung</p>
            <p className="mt-1 font-semibold text-ink">{props.selectedHouse?.name ?? "-"}</p>
            <p className="text-sm text-slate-500">{props.selectedHouse?.address ?? "-"}</p>
          </div>
          <input
            className="h-11 rounded-[8px] border border-slate-200 px-3"
            placeholder="Nominal penarikan"
            inputMode="numeric"
            value={props.amount}
            onChange={(event) => props.setAmount(event.target.value)}
          />
          <textarea
            className="min-h-24 rounded-[8px] border border-slate-200 p-3"
            placeholder="Catatan"
            value={props.notes}
            onChange={(event) => props.setNotes(event.target.value)}
          />
          <button className="h-11 rounded-[8px] bg-brand-600 font-semibold text-white" onClick={props.submitWithdrawal}>
            Simpan sebagai pending
          </button>
        </div>
      </Panel>
      <Panel title="Riwayat penarikan">
        <div className="grid gap-3">
          {props.withdrawals.map((item) => (
            <div key={item.id} className="rounded-[8px] border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{item.houseName}</p>
                  <p className="text-sm text-slate-500">{item.boxNumber} - {item.createdAt}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-3 text-xl font-semibold text-ink">{currency.format(item.amount)}</p>
              <p className="mt-1 text-sm text-slate-500">{item.notes}</p>
              {canValidate && item.status === "Pending" ? (
                <div className="mt-4 flex gap-2">
                  <button className="rounded-[6px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => props.updateWithdrawal(item.id, "Validated")}>
                    Validasi
                  </button>
                  <button className="rounded-[6px] border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600" onClick={() => props.updateWithdrawal(item.id, "Rejected")}>
                    Tolak
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function FinanceView({
  stats,
  withdrawals,
  updateWithdrawal
}: {
  stats: DashboardStats;
  withdrawals: Withdrawal[];
  updateWithdrawal: (id: number, status: Withdrawal["status"]) => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Coins} label="Kas masuk tervalidasi" value={currency.format(stats.income)} />
        <StatCard icon={WalletCards} label="Kas keluar dummy" value={currency.format(285000)} />
        <StatCard icon={CheckCircle2} label="Saldo realtime" value={currency.format(stats.balance)} />
      </div>
      <Panel title="Validasi bendahara">
        <DataTable
          headers={["Rumah", "Nominal", "Petugas", "Status", "Aksi"]}
          rows={withdrawals.map((item) => [
            item.houseName,
            currency.format(item.amount),
            item.collector,
            item.status,
            item.status === "Pending" ? (
              <button
                key={item.id}
                className="rounded-[6px] bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => updateWithdrawal(item.id, "Validated")}
              >
                Validasi
              </button>
            ) : (
              "-"
            )
          ])}
        />
      </Panel>
    </div>
  );
}

function ReportsView({ stats, withdrawals }: { stats: DashboardStats; withdrawals: Withdrawal[] }) {
  return (
    <div className="grid gap-6">
      <Panel title="Filter laporan">
        <div className="grid gap-3 md:grid-cols-[180px_180px_1fr_auto]">
          <input className="h-11 rounded-[8px] border border-slate-200 px-3" type="date" defaultValue="2026-05-01" />
          <input className="h-11 rounded-[8px] border border-slate-200 px-3" type="date" defaultValue="2026-05-31" />
          <select className="h-11 rounded-[8px] border border-slate-200 px-3">
            <option>Semua wilayah</option>
            <option>RT01/RW02</option>
            <option>RT02/RW02</option>
          </select>
          <button className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-slate-200 px-4 font-semibold text-slate-700">
            <Download size={18} />
            Export
          </button>
        </div>
      </Panel>
      <Panel title="Ringkasan laporan Mei 2026">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Transaksi" value={String(withdrawals.length)} />
          <Metric label="Tervalidasi" value={String(withdrawals.filter((item) => item.status === "Validated").length)} />
          <Metric label="Total resmi" value={currency.format(stats.income)} />
        </div>
      </Panel>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Role dan permission">
        <DataTable
          headers={["Role", "Status"]}
          rows={accounts.map((item) => [item.role, "Aktif"])}
        />
      </Panel>
      <Panel title="Integrasi WhatsApp">
        <div className="rounded-[8px] border border-dashed border-slate-300 bg-paper p-5">
          <p className="font-semibold text-ink">Adapter belum aktif</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            MVP dummy menyiapkan area konfigurasi untuk Fonnte, Evolution API, atau Baileys pada fase backend.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function AuditLogsView({ account, withdrawals }: { account: Account; withdrawals: Withdrawal[] }) {
  const rows = [
    ["2026-05-18 22:40", account.name, "Login pengurus", "Sesi internal aktif"],
    ["2026-05-18 22:35", "Bendahara", "Validasi penarikan", withdrawals[0]?.boxNumber ?? "-"],
    ["2026-05-18 21:10", "Admin Ranting", "Update data rumah", "RT01/RW02"],
    ["2026-05-18 20:45", "Petugas Lapangan", "Input penarikan", withdrawals[1]?.boxNumber ?? "-"]
  ];

  return (
    <div className="grid gap-6">
      <Panel title="Audit aktivitas internal">
        <DataTable headers={["Waktu", "Aktor", "Aktivitas", "Objek"]} rows={rows} />
      </Panel>
      <Panel title="Catatan keamanan">
        <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Data audit masih dummy untuk MVP. Struktur halaman disiapkan agar nanti bisa
          dihubungkan ke audit log server tanpa mengubah navigasi internal.
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-brand-50 text-brand-700",
    Validated: "bg-brand-50 text-brand-700",
    Pending: "bg-amber-50 text-amber-700",
    Rejected: "bg-red-50 text-red-700",
    Lost: "bg-red-50 text-red-700",
    Damaged: "bg-orange-50 text-orange-700",
    Inactive: "bg-slate-100 text-slate-600"
  };
  return (
    <span className={`rounded-[6px] px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.Inactive}`}>
      {status}
    </span>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 font-semibold text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index} className="border-b border-slate-100">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-3 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-3 py-8 text-center text-slate-500">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
