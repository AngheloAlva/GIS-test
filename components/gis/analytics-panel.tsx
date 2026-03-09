"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Users,
  AlertTriangle,
  FileWarning,
  Building2,
  Network,
  FileText,
  Activity,
} from "lucide-react";

interface AnalyticsData {
  totals: {
    total_clients: number;
    total_plants: number;
    total_networks: number;
    total_documents: number;
    critical_clients: number;
    missing_docs: number;
    missing_photos: number;
    active_clients: number;
    inactive_clients: number;
  };
  byType: { name: string; value: number }[];
  byCriticality: { name: string; value: number }[];
  byEstablishment: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  docCoverage: {
    with_docs: number;
    without_docs: number;
    with_photos: number;
    without_photos: number;
  };
  plantsByType: { name: string; value: number }[];
  networksByType: { name: string; value: number }[];
  networksByStatus: { name: string; value: number }[];
  recentClients: {
    id: number;
    code: string;
    name: string;
    client_type: string;
    criticality: string;
    status: string;
    created_at: string;
  }[];
}

// Compute colors as hex strings for Recharts (NOT CSS vars)
const PRIMARY = "#00b864";
const NAVY = "#003a8e";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const VIOLET = "#8b5cf6";
const SLATE = "#64748b";
const TEAL = "#14b8a6";
const ROSE = "#e11d48";

const CRITICALITY_COLORS: Record<string, string> = {
  alta: RED,
  media: AMBER,
  baja: PRIMARY,
};

const TYPE_COLORS: Record<string, string> = {
  industrial: NAVY,
  comercial: PRIMARY,
  habitacional: AMBER,
  gobierno: VIOLET,
};

const TICK_COLOR = "#94a3b8";
const GRID_COLOR = "#e2e8f0";

const criticalityConfig: ChartConfig = {
  alta: { label: "Alta", color: RED },
  media: { label: "Media", color: AMBER },
  baja: { label: "Baja", color: PRIMARY },
};

const clientTypeConfig: ChartConfig = {
  industrial: { label: "Industrial", color: NAVY },
  comercial: { label: "Comercial", color: PRIMARY },
  habitacional: { label: "Habitacional", color: AMBER },
  gobierno: { label: "Gobierno", color: VIOLET },
};

const docCoverageConfig: ChartConfig = {
  con: { label: "Con documentos", color: PRIMARY },
  sin: { label: "Sin documentos", color: RED },
};

const establishmentConfig: ChartConfig = {
  hospital: { label: "Hospital", color: RED },
  colegio: { label: "Colegio", color: AMBER },
  supermercado: { label: "Supermercado", color: PRIMARY },
  oficina: { label: "Oficina", color: NAVY },
  fabrica: { label: "Fabrica", color: VIOLET },
  residencial: { label: "Residencial", color: TEAL },
  municipal: { label: "Municipal", color: ROSE },
  otro: { label: "Otro", color: SLATE },
};

const ESTABLISHMENT_COLORS: Record<string, string> = {
  hospital: RED,
  colegio: AMBER,
  supermercado: PRIMARY,
  oficina: NAVY,
  fabrica: VIOLET,
  residencial: TEAL,
  municipal: ROSE,
  otro: SLATE,
};

interface AnalyticsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AnalyticsPanel({ open, onClose }: AnalyticsPanelProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-5xl p-0 bg-background border-l border-border"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Panel de Analitica
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            KPIs y graficas basadas en los datos del sistema GIS
          </SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-muted-foreground">
              Cargando datos...
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="px-6 py-5 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                  title="Total Clientes"
                  value={data.totals.total_clients}
                  icon={<Users className="h-4 w-4" />}
                  color="primary"
                />
                <KpiCard
                  title="Criticos"
                  value={data.totals.critical_clients}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  color="red"
                  subtitle={`${((data.totals.critical_clients / data.totals.total_clients) * 100).toFixed(1)}% del total`}
                />
                <KpiCard
                  title="Sin Documentos"
                  value={data.totals.missing_docs}
                  icon={<FileWarning className="h-4 w-4" />}
                  color="amber"
                  subtitle={`${((data.totals.missing_docs / data.totals.total_clients) * 100).toFixed(1)}% del total`}
                />
                <KpiCard
                  title="Activos"
                  value={data.totals.active_clients}
                  icon={<Activity className="h-4 w-4" />}
                  color="primary"
                  subtitle={`${((data.totals.active_clients / data.totals.total_clients) * 100).toFixed(1)}% del total`}
                />
              </div>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <KpiCard
                  title="Plantas"
                  value={data.totals.total_plants}
                  icon={<Building2 className="h-4 w-4" />}
                  color="primary"
                  small
                />
                <KpiCard
                  title="Redes"
                  value={data.totals.total_networks}
                  icon={<Network className="h-4 w-4" />}
                  color="primary"
                  small
                />
                <KpiCard
                  title="Documentos"
                  value={data.totals.total_documents}
                  icon={<FileText className="h-4 w-4" />}
                  color="primary"
                  small
                />
              </div>

              {/* Tabs for charts */}
              <Tabs defaultValue="clientes" className="w-full">
                <TabsList className="bg-muted w-full">
                  <TabsTrigger
                    value="clientes"
                    className="flex-1 text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    Clientes
                  </TabsTrigger>
                  <TabsTrigger
                    value="infraestructura"
                    className="flex-1 text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    Infraestructura
                  </TabsTrigger>
                  <TabsTrigger
                    value="cobertura"
                    className="flex-1 text-xs data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    Cobertura
                  </TabsTrigger>
                </TabsList>

                {/* CLIENTES TAB */}
                <TabsContent value="clientes" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Distribucion por Criticidad">
                      <ChartContainer
                        config={criticalityConfig}
                        className="h-[220px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.byCriticality}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              cornerRadius={8}
                              outerRadius={80}
                              innerRadius={40}
                              strokeWidth={2}
                              stroke="#ffffff"
                            >
                              {data.byCriticality.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={CRITICALITY_COLORS[entry.name] || SLATE}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        {data.byCriticality.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <div
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{
                                backgroundColor:
                                  CRITICALITY_COLORS[entry.name] || SLATE,
                              }}
                            />
                            <span className="text-muted-foreground capitalize">
                              {entry.name}
                            </span>
                            <span className="font-medium text-foreground">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ChartCard>

                    <ChartCard title="Clientes por Tipo">
                      <ChartContainer
                        config={clientTypeConfig}
                        className="h-[220px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.byType}
                            layout="vertical"
                            margin={{ left: 8 }}
                          >
                            <CartesianGrid
                              horizontal={false}
                              strokeDasharray="3 3"
                              stroke={GRID_COLOR}
                            />
                            <XAxis
                              type="number"
                              tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{ fill: TICK_COLOR, fontSize: 11 }}
                              width={90}
                              tickFormatter={(v) =>
                                v.charAt(0).toUpperCase() + v.slice(1)
                              }
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {data.byType.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={TYPE_COLORS[entry.name] || SLATE}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </ChartCard>
                  </div>

                  <ChartCard title="Clientes por Tipo de Establecimiento">
                    <ChartContainer
                      config={establishmentConfig}
                      className="h-[250px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.byEstablishment}
                          margin={{ bottom: 8 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: TICK_COLOR, fontSize: 10 }}
                            tickFormatter={(v) =>
                              v.charAt(0).toUpperCase() + v.slice(1)
                            }
                          />
                          <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.byEstablishment.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={ESTABLISHMENT_COLORS[entry.name] || SLATE}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartCard>

                  <ChartCard title="Ultimos Clientes Registrados">
                    <div className="space-y-2">
                      {data.recentClients.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-primary font-medium">
                              {c.code}
                            </span>
                            <span className="text-xs text-foreground truncate max-w-[180px]">
                              {c.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 border-0 ${
                                c.criticality === "alta"
                                  ? "bg-red-100 text-red-700"
                                  : c.criticality === "media"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {c.criticality}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 border-0 ${
                                c.status === "activo"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {c.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </TabsContent>

                {/* INFRAESTRUCTURA TAB */}
                <TabsContent value="infraestructura" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Plantas por Tipo">
                      <ChartContainer
                        config={{
                          planta_principal: {
                            label: "Planta Principal",
                            color: NAVY,
                          },
                          oficina_regional: {
                            label: "Oficina Regional",
                            color: PRIMARY,
                          },
                          subestacion: { label: "Subestacion", color: AMBER },
                          centro_distribucion: {
                            label: "Centro Dist.",
                            color: VIOLET,
                          },
                        }}
                        className="h-[220px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.plantsByType}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              cornerRadius={8}
                              outerRadius={80}
                              innerRadius={40}
                              strokeWidth={2}
                              stroke="#ffffff"
                            >
                              {data.plantsByType.map((entry, idx) => (
                                <Cell
                                  key={entry.name}
                                  fill={[NAVY, PRIMARY, AMBER, VIOLET][idx % 4]}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                        {data.plantsByType.map((entry, idx) => (
                          <div
                            key={entry.name}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <div
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{
                                backgroundColor: [NAVY, PRIMARY, AMBER, VIOLET][
                                  idx % 4
                                ],
                              }}
                            />
                            <span className="text-muted-foreground">
                              {entry.name.replace(/_/g, " ")}
                            </span>
                            <span className="font-medium text-foreground">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ChartCard>

                    <ChartCard title="Redes por Tipo">
                      <ChartContainer
                        config={{
                          red_primaria: { label: "Red Primaria", color: NAVY },
                          red_secundaria: {
                            label: "Red Secundaria",
                            color: PRIMARY,
                          },
                          red_distribucion: {
                            label: "Red Distribucion",
                            color: AMBER,
                          },
                          conexion: { label: "Conexion", color: VIOLET },
                        }}
                        className="h-[220px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={data.networksByType}
                            layout="vertical"
                            margin={{ left: 12 }}
                          >
                            <CartesianGrid
                              horizontal={false}
                              strokeDasharray="3 3"
                              stroke={GRID_COLOR}
                            />
                            <XAxis
                              type="number"
                              tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{ fill: TICK_COLOR, fontSize: 10 }}
                              width={110}
                              tickFormatter={(v) => v.replace(/_/g, " ")}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {data.networksByType.map((entry, idx) => (
                                <Cell
                                  key={entry.name}
                                  fill={[NAVY, PRIMARY, AMBER, VIOLET][idx % 4]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </ChartCard>
                  </div>

                  <ChartCard title="Estado de Redes">
                    <ChartContainer
                      config={{
                        activo: { label: "Activo", color: PRIMARY },
                        inactivo: { label: "Inactivo", color: RED },
                        en_construccion: {
                          label: "En Construccion",
                          color: AMBER,
                        },
                      }}
                      className="h-[200px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.networksByStatus}>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: TICK_COLOR, fontSize: 11 }}
                            tickFormatter={(v) => v.replace(/_/g, " ")}
                          />
                          <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.networksByStatus.map((entry) => {
                              const c =
                                entry.name === "activo"
                                  ? PRIMARY
                                  : entry.name === "inactivo"
                                    ? RED
                                    : AMBER;
                              return <Cell key={entry.name} fill={c} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartCard>
                </TabsContent>

                {/* COBERTURA TAB */}
                <TabsContent value="cobertura" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Cobertura Documental">
                      <ChartContainer
                        config={docCoverageConfig}
                        className="h-[220px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "con",
                                  value: data.docCoverage.with_docs,
                                },
                                {
                                  name: "sin",
                                  value: data.docCoverage.without_docs,
                                },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              cornerRadius={8}
                              outerRadius={80}
                              innerRadius={40}
                              strokeWidth={2}
                              stroke="#ffffff"
                            >
                              <Cell fill={PRIMARY} />
                              <Cell fill={RED} />
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: PRIMARY }}
                          />
                          <span className="text-muted-foreground">
                            Con docs
                          </span>
                          <span className="font-medium text-foreground">
                            {data.docCoverage.with_docs}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: RED }}
                          />
                          <span className="text-muted-foreground">
                            Sin docs
                          </span>
                          <span className="font-medium text-foreground">
                            {data.docCoverage.without_docs}
                          </span>
                        </div>
                      </div>
                    </ChartCard>

                    <ChartCard title="Cobertura Fotografica">
                      <ChartContainer
                        config={{
                          con: { label: "Con fotos", color: PRIMARY },
                          sin: { label: "Sin fotos", color: RED },
                        }}
                        className="h-[220px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "con",
                                  value: data.docCoverage.with_photos,
                                },
                                {
                                  name: "sin",
                                  value: data.docCoverage.without_photos,
                                },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              cornerRadius={8}
                              outerRadius={80}
                              innerRadius={40}
                              strokeWidth={2}
                              stroke="#ffffff"
                            >
                              <Cell fill={PRIMARY} />
                              <Cell fill={RED} />
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: PRIMARY }}
                          />
                          <span className="text-muted-foreground">
                            Con fotos
                          </span>
                          <span className="font-medium text-foreground">
                            {data.docCoverage.with_photos}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div
                            className="h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: RED }}
                          />
                          <span className="text-muted-foreground">
                            Sin fotos
                          </span>
                          <span className="font-medium text-foreground">
                            {data.docCoverage.without_photos}
                          </span>
                        </div>
                      </div>
                    </ChartCard>
                  </div>

                  <ChartCard title="Resumen de Cobertura">
                    <div className="space-y-4 py-2">
                      <CoverageBar
                        label="Documentos"
                        filled={data.docCoverage.with_docs}
                        total={
                          data.docCoverage.with_docs +
                          data.docCoverage.without_docs
                        }
                      />
                      <CoverageBar
                        label="Fotografias"
                        filled={data.docCoverage.with_photos}
                        total={
                          data.docCoverage.with_photos +
                          data.docCoverage.without_photos
                        }
                      />
                      <CoverageBar
                        label="Clientes Activos"
                        filled={data.totals.active_clients}
                        total={data.totals.total_clients}
                      />
                      <CoverageBar
                        label="Clientes No Criticos"
                        filled={
                          data.totals.total_clients -
                          data.totals.critical_clients
                        }
                        total={data.totals.total_clients}
                      />
                    </div>
                  </ChartCard>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function KpiCard({
  title,
  value,
  icon,
  color,
  subtitle,
  small,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "red" | "amber";
  subtitle?: string;
  small?: boolean;
}) {
  const colorClasses = {
    primary: "bg-[#00b864]/10 text-[#00b864]",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Card className="bg-background border-border shadow-sm">
      <CardContent className={`${small ? "p-3" : "p-4"}`}>
        <div className="flex items-center justify-between">
          <div className={`rounded-md p-1.5 ${colorClasses[color]}`}>
            {icon}
          </div>
          <span
            className={`${small ? "text-lg" : "text-2xl"} font-bold text-foreground tabular-nums`}
          >
            {value.toLocaleString()}
          </span>
        </div>
        <p
          className={`${small ? "text-[10px]" : "text-xs"} text-muted-foreground mt-2`}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-background border-border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
  );
}

function CoverageBar({
  label,
  filled,
  total,
}: {
  label: string;
  filled: number;
  total: number;
}) {
  const pct = total > 0 ? (filled / total) * 100 : 0;
  const barColor = pct >= 80 ? PRIMARY : pct >= 50 ? AMBER : RED;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground tabular-nums">
          {filled}/{total} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
