"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Service, Net } from "@dockitect/schema";
import { useCanvasStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function NodeDetailsPanel() {
  const { selectedNode, setSelectedNode, blueprint } = useCanvasStore();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const isService = selectedNode?.type === "serviceNode";
  const service = selectedNode && isService ? ((selectedNode.data as { service: Service }).service as Service) : null;
  const network = selectedNode && !isService ? ((selectedNode.data as { network: Net }).network as Net) : null;

  const networkServices = useMemo(() => {
    if (!network || !blueprint) return [] as Service[];
    return (blueprint.services || []).filter((s) => (s.networks || []).includes(network.id));
  }, [network, blueprint]);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedValue(label);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Sheet open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>{isService ? service?.name : network?.name}</SheetTitle>
          <SheetDescription>{isService ? "Service Details" : "Network Details"}</SheetDescription>
        </SheetHeader>

        {/* Screen reader live region for copy confirmations */}
        <span className="sr-only" aria-live="polite">
          {copiedValue ? `Copied ${copiedValue} to clipboard` : ""}
        </span>

        {isService && service ? (
          <Tabs defaultValue="overview" className="mt-4" aria-label="Service details tabs">
            <TabsList className="grid w-full grid-cols-5" aria-label="Service detail sections">
              <TabsTrigger value="overview" aria-label="Overview">Overview</TabsTrigger>
              <TabsTrigger value="env" aria-label="Environment">Env</TabsTrigger>
              <TabsTrigger value="volumes" aria-label="Volumes">Volumes</TabsTrigger>
              <TabsTrigger value="ports" aria-label="Ports">Ports</TabsTrigger>
              <TabsTrigger value="networks" aria-label="Networks">Networks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4" aria-label="Service overview">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold mb-2">Image</h3>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm break-all">{service.image}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(service.image, "image")}
                    aria-label="Copy image name"
                  >
                    {copiedValue === "image" ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {service.restart && (
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold mb-2">Restart Policy</h3>
                  <p className="text-sm text-muted-foreground">{service.restart}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="env" className="space-y-2" aria-label="Environment variables">
              {service.env && Object.keys(service.env).length > 0 ? (
                Object.entries(service.env).map(([key, value]) => (
                  <div key={key} className="rounded-lg border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <code className="text-xs font-semibold block">{key}</code>
                        <code className="text-xs text-muted-foreground block break-all mt-1">
                          {value || "(empty)"}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(value ?? "", `env-${key}`)}
                        aria-label={`Copy ${key} value`}
                      >
                        {copiedValue === `env-${key}` ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No environment variables</p>
              )}
            </TabsContent>

            <TabsContent value="volumes" className="space-y-2" aria-label="Volumes">
              {service.volumes && service.volumes.length > 0 ? (
                service.volumes.map((vol, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-3">
                    <code className="text-xs block">
                      {vol.source} 
                      <span className="text-muted-foreground">→</span> {vol.target}
                      {vol.readOnly && <span className="text-muted-foreground"> (ro)</span>}
                    </code>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No volumes</p>
              )}
            </TabsContent>

            <TabsContent value="ports" className="space-y-2" aria-label="Ports">
              {service.ports && service.ports.length > 0 ? (
                service.ports.map((port, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-3">
                    <code className="text-xs block">
                      {port.host}:{port.container}
                      {port.protocol && port.protocol !== "tcp" && (
                        <span className="text-muted-foreground"> ({port.protocol})</span>
                      )}
                    </code>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No ports exposed</p>
              )}
            </TabsContent>

            <TabsContent value="networks" className="space-y-2 mt-4" aria-label="Networks">
              {service.networks && service.networks.length > 0 ? (
                service.networks.map((netId, idx) => {
                  const networkName = blueprint?.networks.find(n => n.id === netId)?.name || netId;
                  return (
                    <div key={idx} className="rounded-lg border bg-card p-3">
                      <code className="text-xs block">{networkName}</code>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No networks</p>
              )}
            </TabsContent>
          </Tabs>
        ) : network ? (
          <Tabs defaultValue="overview" className="mt-4" aria-label="Network details tabs">
            <TabsList className="grid w-full grid-cols-2" aria-label="Network detail sections">
              <TabsTrigger value="overview" aria-label="Overview">Overview</TabsTrigger>
              <TabsTrigger value="services" aria-label="Services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4" aria-label="Network overview">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold mb-2">Driver</h3>
                <p className="text-sm text-muted-foreground">{network.driver ?? "bridge"}</p>
              </div>

              {network.subnetCidr && (
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold mb-2">Subnet</h3>
                  <p className="text-sm text-muted-foreground">{network.subnetCidr}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-2" aria-label="Connected services">
              {networkServices.length > 0 ? (
                networkServices.map((svc) => (
                  <div key={svc.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{svc.name}</div>
                        <div className="text-xs text-muted-foreground break-all">{svc.image}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No connected services</p>
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
