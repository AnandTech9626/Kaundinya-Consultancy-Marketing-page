import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  CalendarDays,
  Download,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  createDailyTask,
  deleteDailyTask,
  fetchDailyTaskAssignees,
  fetchDailyTaskStats,
  fetchDailyTasks,
  updateDailyTask,
  type AdminDailyTask,
  type AdminDailyTaskAssignee,
  type AdminDailyTaskPatch,
  type AdminDailyTaskStats,
  type DailyTaskDisplayStatus,
  type DailyTaskStatus,
} from "../lib/api";
import { useStaffAuth } from "../lib/staff-auth";
import { showToast } from "../lib/toast";
import {
  ConfirmDialog,
  SheetShell,
  inputClass,
  labelClass,
} from "../components/AdminUi";
import { SkeletonRows } from "../components/Skeleton";

const STATUS_OPTIONS: Array<{ value: DailyTaskStatus; label: string }> = [
  { value: "connected_interested", label: "Connected - Interested" },
  { value: "connected_not_interested", label: "Connected - Not Interested" },
  { value: "not_reachable", label: "Number Not Reachable" },
  { value: "call_back", label: "Asked to Call back" },
];

const STATUS_LABELS: Record<DailyTaskDisplayStatus, string> = {
  connected_interested: "Connected - Interested",
  connected_not_interested: "Connected - Not Interested",
  not_reachable: "Number Not Reachable",
  call_back: "Asked to Call back",
  pending: "Pending",
  not_contacted: "Not contacted",
};

const STATUS_STYLES: Record<DailyTaskDisplayStatus, string> = {
  connected_interested: "border-emerald-200 bg-emerald-50 text-emerald-700",
  connected_not_interested: "border-rose-200 bg-rose-50 text-rose-700",
  not_reachable: "border-amber-200 bg-amber-50 text-amber-700",
  call_back: "border-violet-200 bg-violet-50 text-violet-700",
  pending: "border-orange-200 bg-orange-50 text-orange-700",
  not_contacted: "border-border-subtle bg-ivory text-muted",
};

function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TaskStatusBadge({ status }: { status: DailyTaskDisplayStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        STATUS_STYLES[status]
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

type GroupedTasks = Array<[string, AdminDailyTask[]]>;

export function DailyTasks() {
  const { staff } = useStaffAuth();
  const isAdmin = staff?.role === "admin";

  const [tasks, setTasks] = useState<AdminDailyTask[]>([]);
  const [stats, setStats] = useState<AdminDailyTaskStats | null>(null);
  const [agents, setAgents] = useState<AdminDailyTaskAssignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<AdminDailyTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDailyTask | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [nextTasks, nextStats] = await Promise.all([
          fetchDailyTasks({
            date: dateFilter || undefined,
            status: statusFilter || undefined,
            assignedTo: isAdmin ? assigneeFilter || undefined : undefined,
          }),
          fetchDailyTaskStats(),
        ]);
        setTasks(nextTasks);
        setStats(nextStats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load daily tasks.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateFilter, statusFilter, assigneeFilter, isAdmin],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    fetchDailyTaskAssignees()
      .then((next) => {
        if (!cancelled) {
          setAgents(next.filter((agent) => agent.role === "partner"));
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const grouped: GroupedTasks = useMemo(() => {
    const map = new Map<string, AdminDailyTask[]>();
    for (const task of tasks) {
      const list = map.get(task.taskDate) ?? [];
      list.push(task);
      map.set(task.taskDate, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0,
    );
  }, [tasks]);

  const defaultAssignee =
    agents.find((agent) => agent.role === "partner")?.id ??
    agents[0]?.id ??
    "";

  const kpis = stats
    ? [
        { label: "Total", value: stats.total },
        { label: "Pending", value: stats.pending },
        { label: "Not contacted", value: stats.notContacted },
        { label: "Interested", value: stats.connectedInterested },
        { label: "Not interested", value: stats.connectedNotInterested },
        { label: "Not reachable", value: stats.notReachable },
        { label: "Call back", value: stats.callBack },
      ]
    : [];

  const refresh = async () => {
    setRefreshing(true);
    await load(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDailyTask(deleteTarget.id);
      setDeleteTarget(null);
      showToast("Daily task deleted.");
      await load(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete the task.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const downloadDayPdf = async (date: string, rows: AdminDailyTask[]) => {
    setPdfBusy(date);
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      doc.setFontSize(14);
      doc.text(`Daily Tasks - ${formatDateLabel(date)}`, 40, 40);
      doc.setFontSize(9);
      doc.text(
        `Generated ${new Date().toLocaleString("en-IN")} · ${
          rows.length
        } row(s)`,
        40,
        56,
      );

      autoTable(doc, {
        startY: 70,
        head: [
          [
            "S.No",
            "Mobile 1",
            "Mobile 2",
            "Name",
            "Email",
            "Call time",
            "Duration (min)",
            "Status",
            "Interested",
            "Reason",
            "Next step",
            "Comments",
          ],
        ],
        body: rows.map((task, index) => [
          String(index + 1),
          task.mobilePrimary,
          task.mobileSecondary || "",
          task.customerName || "",
          task.email || "",
          formatTime(task.calledAt),
          task.durationMinutes == null ? "" : String(task.durationMinutes),
          STATUS_LABELS[task.displayStatus],
          task.interested == null ? "" : task.interested ? "Yes" : "No",
          task.reasonNotInterested || "",
          task.nextStep || "",
          task.comments || "",
        ]),
        styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [30, 30, 32], textColor: 255 },
      });

      doc.save(`daily-tasks-${date}.pdf`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not build the PDF.",
        "error",
      );
    } finally {
      setPdfBusy(null);
    }
  };

  const hasActiveFilter = Boolean(
    dateFilter || statusFilter || assigneeFilter,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Call center
          </p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-charcoal">
            Daily Tasks
          </h1>
          <p className="mt-1 text-xs text-muted">
            {isAdmin
              ? "Assign the daily call list and review every agent update."
              : "Your assigned calls for today. Update each status after the call."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-2 text-xs font-bold text-charcoal hover:bg-gold-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Add row
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border-subtle bg-white px-3 py-2.5"
            >
              <p className="text-xl font-extrabold tracking-tight text-charcoal">
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold leading-tight text-muted">
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-border-subtle bg-white p-3">
        <div>
          <label className={labelClass} htmlFor="daily-date-filter">
            Date
          </label>
          <input
            id="daily-date-filter"
            type="date"
            className={`${inputClass} w-40`}
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="daily-status-filter">
            Status
          </label>
          <select
            id="daily-status-filter"
            className={`${inputClass} w-52`}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending / Not contacted</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className={labelClass} htmlFor="daily-agent-filter">
              Agent
            </label>
            <select
              id="daily-agent-filter"
              className={`${inputClass} w-52`}
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
            >
              <option value="">All agents</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.staffCode} ({agent.role})
                </option>
              ))}
            </select>
          </div>
        )}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setDateFilter("");
              setStatusFilter("");
              setAssigneeFilter("");
            }}
            className="rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs font-bold text-muted hover:text-charcoal"
          >
            Clear
          </button>
        )}
        <p className="ml-auto text-[11px] text-muted">
          Last 10 days are kept automatically.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-4">
          <SkeletonRows rows={5} itemClass="h-12" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-8 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-muted-light" />
          <p className="mt-3 text-sm font-bold text-charcoal">
            No tasks in this view
          </p>
          <p className="mt-1 text-xs text-muted">
            {isAdmin
              ? "Add a row to start today's call list."
              : "Your assigned calls will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, rows]) => (
            <section
              key={date}
              className="overflow-hidden rounded-2xl border border-border-subtle bg-white"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-charcoal">
                    {formatDateLabel(date)}
                  </h2>
                  <p className="text-[11px] text-muted">
                    {rows.length} row{rows.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void downloadDayPdf(date, rows)}
                  disabled={pdfBusy === date}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {pdfBusy === date ? "Preparing..." : "Download PDF"}
                </button>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[2300px] table-auto text-left text-xs">
                  <thead className="bg-ivory text-[10px] font-bold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="min-w-[56px] whitespace-nowrap px-3 py-2">
                        S.No
                      </th>
                      <th className="min-w-[130px] whitespace-nowrap px-3 py-2">
                        Mobile 1
                      </th>
                      <th className="min-w-[130px] whitespace-nowrap px-3 py-2">
                        Mobile 2
                      </th>
                      <th className="min-w-[180px] whitespace-nowrap px-3 py-2">
                        Name
                      </th>
                      <th className="min-w-[240px] whitespace-nowrap px-3 py-2">
                        Email
                      </th>
                      <th className="min-w-[120px] whitespace-nowrap px-3 py-2">
                        Call time
                      </th>
                      <th className="min-w-[110px] whitespace-nowrap px-3 py-2">
                        Duration
                      </th>
                      <th className="min-w-[180px] whitespace-nowrap px-3 py-2">
                        Status
                      </th>
                      <th className="min-w-[110px] whitespace-nowrap px-3 py-2">
                        Interested
                      </th>
                      <th className="min-w-[230px] whitespace-nowrap px-3 py-2">
                        Reason
                      </th>
                      <th className="min-w-[230px] whitespace-nowrap px-3 py-2">
                        Next step
                      </th>
                      <th className="min-w-[300px] whitespace-nowrap px-3 py-2">
                        Comments
                      </th>
                      {isAdmin && (
                        <th className="min-w-[150px] whitespace-nowrap px-3 py-2">
                          Agent
                        </th>
                      )}
                      <th className="min-w-[160px] whitespace-nowrap px-3 py-2 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {rows.map((task, index) => (
                      <tr key={task.id} className="align-top">
                        <td className="px-3 py-2.5 font-semibold text-muted">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-bold text-charcoal">
                          {task.mobilePrimary}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                          {task.mobileSecondary || "—"}
                        </td>
                        <td className="min-w-[180px] break-words px-3 py-2.5 font-semibold text-charcoal">
                          {task.customerName || "—"}
                        </td>
                        <td className="min-w-[240px] break-words px-3 py-2.5 text-muted">
                          {task.email || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                          {formatTime(task.calledAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                          {task.durationMinutes == null
                            ? "—"
                            : `${task.durationMinutes} min`}
                        </td>
                        <td className="px-3 py-2.5">
                          <TaskStatusBadge status={task.displayStatus} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                          {task.interested == null
                            ? "—"
                            : task.interested
                              ? "Yes"
                              : "No"}
                        </td>
                        <td className="min-w-[230px] break-words px-3 py-2.5 text-muted">
                          {task.reasonNotInterested || "—"}
                        </td>
                        <td className="min-w-[230px] break-words px-3 py-2.5 text-muted">
                          {task.nextStep || "—"}
                        </td>
                        <td className="min-w-[300px] break-words px-3 py-2.5 text-muted">
                          {task.comments || "—"}
                        </td>
                        {isAdmin && (
                          <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                            {task.assignedByName || task.assignedByCode || "—"}
                          </td>
                        )}
                        <td className="whitespace-nowrap px-3 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditTask(task)}
                              className="inline-flex items-center gap-1 rounded-md border border-border-subtle px-2 py-1 text-[11px] font-bold text-charcoal hover:border-gold/60"
                            >
                              <Pencil className="h-3 w-3" />
                              Update
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(task)}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {addOpen && (
        <AddTaskSheet
          agents={agents}
          defaultAssignee={defaultAssignee}
          onClose={() => setAddOpen(false)}
          onSaved={async () => {
            setAddOpen(false);
            showToast("Daily task added.");
            await load(true);
          }}
        />
      )}

      {editTask && (
        <UpdateTaskSheet
          task={editTask}
          isAdmin={isAdmin}
          agents={agents}
          onClose={() => setEditTask(null)}
          onSaved={async () => {
            setEditTask(null);
            showToast("Daily task updated.");
            await load(true);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this row?"
          message={`Remove the call for ${deleteTarget.mobilePrimary}${
            deleteTarget.customerName
              ? ` (${deleteTarget.customerName})`
              : ""
          } on ${formatDateLabel(deleteTarget.taskDate)}?`}
          busy={deleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function AddTaskSheet({
  agents,
  defaultAssignee,
  onClose,
  onSaved,
}: {
  agents: AdminDailyTaskAssignee[];
  defaultAssignee: string;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [taskDate, setTaskDate] = useState(todayIso());
  const [mobilePrimary, setMobilePrimary] = useState("");
  const [mobileSecondary, setMobileSecondary] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [assignedTo, setAssignedTo] = useState(defaultAssignee);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^[6-9]\d{9}$/.test(mobilePrimary.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (
      mobileSecondary.trim() &&
      !/^[6-9]\d{9}$/.test(mobileSecondary.trim())
    ) {
      setError("Enter a valid 10-digit secondary mobile number.");
      return;
    }
    if (!taskDate) {
      setError("Pick the call date.");
      return;
    }

    setBusy(true);
    try {
      await createDailyTask({
        taskDate,
        mobilePrimary: mobilePrimary.trim(),
        mobileSecondary: mobileSecondary.trim(),
        customerName: customerName.trim(),
        email: email.trim(),
        assignedTo: assignedTo || undefined,
      });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the task.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Daily tasks"
      title="Add a call row"
      subtitle="Enter the client details for the daily call list."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="add-task-date">
              Call date
            </label>
            <input
              id="add-task-date"
              type="date"
              className={inputClass}
              value={taskDate}
              onChange={(event) => setTaskDate(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="add-assignee">
              Assign to
            </label>
            <select
              id="add-assignee"
              className={inputClass}
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
            >
              {agents.length === 0 && (
                <option value="">Default partner</option>
              )}
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.staffCode} ({agent.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="add-mobile-1">
              Mobile 1
            </label>
            <input
              id="add-mobile-1"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={inputClass}
              value={mobilePrimary}
              onChange={(event) =>
                setMobilePrimary(
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="add-mobile-2">
              Mobile 2 (optional)
            </label>
            <input
              id="add-mobile-2"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={inputClass}
              value={mobileSecondary}
              onChange={(event) =>
                setMobileSecondary(
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="Alternate number"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="add-name">
              Name of the Cx
            </label>
            <input
              id="add-name"
              className={inputClass}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Client name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="add-email">
              Email ID
            </label>
            <input
              id="add-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="client@example.com"
            />
          </div>
        </div>

        {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
          >
            {busy ? "Adding..." : "Add row"}
          </button>
        </div>
      </form>
    </SheetShell>
  );
}

function UpdateTaskSheet({
  task,
  isAdmin,
  agents,
  onClose,
  onSaved,
}: {
  task: AdminDailyTask;
  isAdmin: boolean;
  agents: AdminDailyTaskAssignee[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [taskDate, setTaskDate] = useState(task.taskDate);
  const [mobilePrimary, setMobilePrimary] = useState(task.mobilePrimary);
  const [mobileSecondary, setMobileSecondary] = useState(
    task.mobileSecondary,
  );
  const [customerName, setCustomerName] = useState(task.customerName);
  const [email, setEmail] = useState(task.email);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);
  const [status, setStatus] = useState(task.status ?? "");
  const [interested, setInterested] = useState(
    task.interested == null ? "" : task.interested ? "yes" : "no",
  );
  const [calledAt, setCalledAt] = useState(toLocalInput(task.calledAt));
  const [durationMinutes, setDurationMinutes] = useState(
    task.durationMinutes == null ? "" : String(task.durationMinutes),
  );
  const [reasonNotInterested, setReasonNotInterested] = useState(
    task.reasonNotInterested,
  );
  const [nextStep, setNextStep] = useState(task.nextStep);
  const [comments, setComments] = useState(task.comments);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const patch: AdminDailyTaskPatch = {
      status: status === "" ? null : (status as DailyTaskStatus),
      interested:
        interested === "" ? null : interested === "yes",
      reasonNotInterested: reasonNotInterested.trim(),
      nextStep: nextStep.trim(),
      comments: comments.trim(),
      calledAt: calledAt ? new Date(calledAt).toISOString() : null,
      durationMinutes:
        durationMinutes === "" ? null : Number(durationMinutes),
    };

    if (isAdmin) {
      if (!/^[6-9]\d{9}$/.test(mobilePrimary.trim())) {
        setError("Enter a valid 10-digit mobile number.");
        return;
      }
      if (
        mobileSecondary.trim() &&
        !/^[6-9]\d{9}$/.test(mobileSecondary.trim())
      ) {
        setError("Enter a valid 10-digit secondary mobile number.");
        return;
      }
      patch.taskDate = taskDate;
      patch.mobilePrimary = mobilePrimary.trim();
      patch.mobileSecondary = mobileSecondary.trim();
      patch.customerName = customerName.trim();
      patch.email = email.trim();
      patch.assignedTo = assignedTo;
    }

    setBusy(true);
    try {
      await updateDailyTask(task.id, patch);
      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update the task.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Daily tasks"
      title={task.customerName || task.mobilePrimary}
      subtitle={`${formatDateLabel(task.taskDate)} · ${
        task.assignedByName || task.assignedByCode || "Unassigned"
      }`}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="update-status">
            Status
          </label>
          <select
            id="update-status"
            className={inputClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Not updated</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="update-called-at">
              Call date &amp; time
            </label>
            <input
              id="update-called-at"
              type="datetime-local"
              className={inputClass}
              value={calledAt}
              onChange={(event) => setCalledAt(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="update-duration">
              Duration (minutes)
            </label>
            <input
              id="update-duration"
              type="number"
              min={0}
              max={600}
              className={inputClass}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              placeholder="e.g. 5"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="update-interested">
              Interested
            </label>
            <select
              id="update-interested"
              className={inputClass}
              value={interested}
              onChange={(event) => setInterested(event.target.value)}
            >
              <option value="">—</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="update-reason">
            Reason if not interested
          </label>
          <textarea
            id="update-reason"
            rows={2}
            className={inputClass}
            value={reasonNotInterested}
            onChange={(event) => setReasonNotInterested(event.target.value)}
            placeholder="Why the client is not interested"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="update-next">
            Next step
          </label>
          <textarea
            id="update-next"
            rows={2}
            className={inputClass}
            value={nextStep}
            onChange={(event) => setNextStep(event.target.value)}
            placeholder="Follow-up plan"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="update-comments">
            Comments
          </label>
          <textarea
            id="update-comments"
            rows={2}
            className={inputClass}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Any notes from the call"
          />
        </div>

        {isAdmin && (
          <div className="space-y-3 rounded-xl border border-border-subtle bg-ivory p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Admin fields
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="update-date">
                  Call date
                </label>
                <input
                  id="update-date"
                  type="date"
                  className={inputClass}
                  value={taskDate}
                  onChange={(event) => setTaskDate(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="update-assignee">
                  Assign to
                </label>
                <select
                  id="update-assignee"
                  className={inputClass}
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name || agent.staffCode} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="update-mobile-1">
                  Mobile 1
                </label>
                <input
                  id="update-mobile-1"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className={inputClass}
                  value={mobilePrimary}
                  onChange={(event) =>
                    setMobilePrimary(
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="update-mobile-2">
                  Mobile 2
                </label>
                <input
                  id="update-mobile-2"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className={inputClass}
                  value={mobileSecondary}
                  onChange={(event) =>
                    setMobileSecondary(
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="update-name">
                  Name of the Cx
                </label>
                <input
                  id="update-name"
                  className={inputClass}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="update-email">
                  Email ID
                </label>
                <input
                  id="update-email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save update"}
          </button>
        </div>
      </form>
    </SheetShell>
  );
}
