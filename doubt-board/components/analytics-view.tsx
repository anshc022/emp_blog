"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NumberFlow from "@number-flow/react";
import { ChartBarIcon, ClockIcon, FireIcon, PlusIcon, SealCheckIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Analytics } from "@/lib/analytics";
import { api } from "@/lib/api-client";

// Validated with the dataviz palette checker (CVD separation, lightness band,
// contrast) against each mode's card surface. Slot 1 = answered/primary, slot 2 = open.
const PALETTE = {
  light: { s1: "#6c47ff", s2: "#f06a2c", grid: "#ece7de", axis: "#6b6577" },
  dark: { s1: "#8f73ff", s2: "#d9692e", grid: "#26212f", axis: "#9d96ab" },
};

function usePalette() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return PALETTE[mounted && resolvedTheme === "dark" ? "dark" : "light"];
}

const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;

function ChartTooltip({ active, payload, label, format }: TooltipContentProps<number, string> & { format: (p: Record<string, number | string>, label: unknown) => React.ReactNode }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground shadow-pop rounded-xl border px-3 py-2 text-xs">
      {format(payload[0].payload as Record<string, number | string>, label)}
    </div>
  );
}

export function AnalyticsView() {
  const c = usePalette();
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"), []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", tz],
    queryFn: () => api<Analytics>(`/api/analytics?tz=${encodeURIComponent(tz!)}`),
    enabled: !!tz,
  });

  if (error) return <EmptyState mood="shocked" title="Couldn't load analytics" description={error.message} />;

  const header = (
    <div className="mb-8">
      <h1 className="text-4xl font-extrabold sm:text-5xl">
        the <span className="font-serif-i text-primary font-normal">vibe check</span>
      </h1>
      <p className="text-muted-foreground mt-2">Where your class gets stuck, and when.</p>
    </div>
  );

  if (isLoading || !data) {
    return (
      <div>
        {header}
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (data.status.total === 0) {
    return (
      <div>
        {header}
        <EmptyState
          mood="sleepy"
          title="No data yet"
          description="Run a session and let students ask a few doubts — charts will appear here."
          action={
            <Button asChild>
              <Link href="/teacher/new">
                <PlusIcon weight="bold" /> New session
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const answeredPct = Math.round((data.status.answered / data.status.total) * 100);
  const donut = [
    { name: "Answered", value: data.status.answered, color: c.s1 },
    { name: "Open", value: data.status.open, color: c.s2 },
  ];
  // Trim the hour axis to the span that has activity (±1h) so bars stay readable.
  const active = data.byHour.filter((h) => h.count > 0).map((h) => h.hour);
  const hours = data.byHour.slice(Math.max(0, Math.min(...active) - 1), Math.min(24, Math.max(...active) + 2));
  const peak = data.byHour.reduce((a, b) => (b.count > a.count ? b : a));

  return (
    <div>
      {header}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Total doubts", value: data.status.total, icon: ChartBarIcon, cls: "bg-card" },
          { label: "Answered", value: answeredPct, suffix: "%", icon: SealCheckIcon, cls: "bg-lime text-lime-foreground border-transparent" },
          { label: "Still open", value: data.status.open, icon: FireIcon, cls: "bg-card" },
          { label: "Peak hour", text: peak.count ? hourLabel(peak.hour) : "—", icon: ClockIcon, cls: "bg-card" },
        ].map((t) => (
          <div key={t.label} className={`shadow-soft flex flex-col gap-5 rounded-3xl border p-5 ${t.cls}`}>
            <div className="flex items-center justify-between text-sm font-semibold opacity-75">
              {t.label}
              <t.icon weight="duotone" className="size-5" />
            </div>
            {"text" in t ? (
              <span className="font-display text-4xl leading-none font-extrabold">{t.text}</span>
            ) : (
              <NumberFlow value={t.value ?? 0} suffix={t.suffix} className="font-display text-4xl leading-none font-extrabold" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Most confusing topics</CardTitle>
            <CardDescription>Top 5 by number of doubts, last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topTopics.length === 0 ? (
              <p className="text-muted-foreground py-16 text-center text-sm">No doubts in the last 7 days.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topTopics} layout="vertical" margin={{ left: 8, right: 32 }} barCategoryGap={10}>
                    <CartesianGrid horizontal={false} stroke={c.grid} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: c.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      width={96}
                      tick={{ fill: c.axis, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: c.grid, opacity: 0.5 }}
                      content={(p) => (
                        <ChartTooltip
                          {...(p as TooltipContentProps<number, string>)}
                          format={(d) => (
                            <>
                              <div className="font-semibold">{d.topic}</div>
                              <div>{d.count} doubts</div>
                              <div className="text-muted-foreground">{d.upvotes} upvotes</div>
                            </>
                          )}
                        />
                      )}
                    />
                    <Bar
                      dataKey="count"
                      fill={c.s1}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={28}
                      label={{ position: "right", fill: c.axis, fontSize: 12 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Answered vs open</CardTitle>
            <CardDescription>All sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donut}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="92%"
                    paddingAngle={2}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {donut.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(p) => (
                      <ChartTooltip
                        {...(p as TooltipContentProps<number, string>)}
                        format={(d) => (
                          <>
                            <span className="font-semibold">{d.name}</span>: {d.value}
                          </>
                        )}
                      />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-display text-4xl font-extrabold tabular-nums">{answeredPct}%</div>
                  <div className="text-muted-foreground text-xs">answered</div>
                </div>
              </div>
            </div>
            <ul className="mt-4 flex justify-center gap-6 text-sm">
              {donut.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ background: d.color }} />
                  {d.name}
                  <span className="text-muted-foreground tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>When doubts come in</CardTitle>
            <CardDescription>Doubts by hour of day ({data.timezone})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hours} margin={{ left: -16, right: 8 }} barCategoryGap={6}>
                  <CartesianGrid vertical={false} stroke={c.grid} />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={hourLabel}
                    tick={{ fill: c.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: c.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: c.grid, opacity: 0.5 }}
                    content={(p) => (
                      <ChartTooltip
                        {...(p as TooltipContentProps<number, string>)}
                        format={(d) => (
                          <>
                            <div className="font-semibold">
                              {hourLabel(Number(d.hour))}–{hourLabel((Number(d.hour) + 1) % 24)}
                            </div>
                            <div>{d.count} doubts</div>
                          </>
                        )}
                      />
                    )}
                  />
                  <Bar dataKey="count" fill={c.s1} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden pb-0 lg:col-span-5">
          <CardHeader className="pb-4">
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Per-session summary</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Session</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 text-right font-medium">Doubts</th>
                  <th className="px-3 py-2.5 text-right font-medium">Upvotes</th>
                  <th className="w-48 px-6 py-2.5 font-medium">Answered</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40 border-t">
                    <td className="px-6 py-3">
                      <Link href={`/teacher/session/${s.id}`} className="font-medium hover:underline">
                        {s.title}
                      </Link>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        {s.subject}
                        {s.isActive && (
                          <Badge variant="success" className="h-4 px-1.5 text-[10px] font-bold uppercase">
                            Live
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.total}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.upvotes}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${s.answeredPct}%`, background: c.s1 }} />
                        </div>
                        <span className="w-10 text-right tabular-nums">{s.total ? `${s.answeredPct}%` : "—"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
