"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { SettingsTopBar } from "@/components/settings/SettingsTopBar";
import { SettingsNavPills } from "@/components/settings/SettingsNavPills";
import { SettingsSummaryRow } from "@/components/settings/SettingsSummaryRow";
import { SatelliteFeedsPanel } from "@/components/settings/SatelliteFeedsPanel";
import { ModelEnginePanel } from "@/components/settings/ModelEnginePanel";
import { WebhooksPanel } from "@/components/settings/WebhooksPanel";
import { DeveloperApiHub } from "@/components/settings/DeveloperApiHub";
import { SecurityAuditPanel } from "@/components/settings/SecurityAuditPanel";
import { initialSettingsState } from "@/components/settings/settingsData";
import { 
  SystemSettingsState, 
  SettingsCategory, 
  MosdacConfig, 
  NoaaS3Config, 
  PinnWeights, 
  HardwareTelemetry, 
  WebhookEndpoint, 
  ApiToken 
} from "@/components/settings/types";

/**
 * CYCLO-AI Page 8: System Settings & Data Connectors (/settings)
 * Streamlined to strictly match the layout and design system of /model-metrics & /alerts
 */
function SettingsContent() {
  const [configState, setConfigState] = useState<SystemSettingsState>(initialSettingsState);
  const [savedSnapshot, setSavedSnapshot] = useState<SystemSettingsState>(initialSettingsState);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Active Category (satellite-feeds, model-engine, webhooks, api-hub, security)
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("satellite-feeds");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "warning" | "error";
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "warning" | "error" = "success") => {
    setToastMessage({ text, type });
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Handle URL hash anchor navigation (e.g., from /model-metrics linking to /settings#model-engine)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SettingsCategory;
    if (
      hash === "satellite-feeds" ||
      hash === "model-engine" ||
      hash === "webhooks" ||
      hash === "api-hub" ||
      hash === "security"
    ) {
      setActiveCategory(hash);
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, []);

  // Handlers
  const handleUpdateMosdac = (updated: Partial<MosdacConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      mosdac: { ...prev.mosdac, ...updated },
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateNoaaS3 = (updated: Partial<NoaaS3Config>) => {
    setConfigState((prev) => ({
      ...prev,
      noaaS3: { ...prev.noaaS3, ...updated },
    }));
    setHasUnsavedChanges(true);
  };

  const handleDeployCheckpoint = (checkpointId: string) => {
    setConfigState((prev) => {
      const updatedCheckpoints = prev.checkpoints.map((cp) => ({
        ...cp,
        isActive: cp.id === checkpointId,
      }));
      const deployedModel = updatedCheckpoints.find((c) => c.id === checkpointId);

      const newAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        operator: "Dr. S. Mukherjee",
        action: `Model checkpoint hot-swapped to ${deployedModel?.name}`,
        category: "model" as const,
        ipAddress: "10.244.12.8",
        status: "success" as const,
      };

      return {
        ...prev,
        checkpoints: updatedCheckpoints,
        auditLogs: [newAuditLog, ...prev.auditLogs],
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdatePinnWeights = (updated: Partial<PinnWeights>) => {
    setConfigState((prev) => ({
      ...prev,
      pinnWeights: { ...prev.pinnWeights, ...updated },
    }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateHardware = (updated: Partial<HardwareTelemetry>) => {
    setConfigState((prev) => ({
      ...prev,
      hardware: { ...prev.hardware, ...updated },
    }));
  };

  const handleUpdateWebhook = (id: string, updated: Partial<WebhookEndpoint>) => {
    setConfigState((prev) => ({
      ...prev,
      webhooks: prev.webhooks.map((w) => (w.id === id ? { ...w, ...updated } : w)),
    }));
    setHasUnsavedChanges(true);
  };

  const handleGenerateToken = (newToken: ApiToken) => {
    setConfigState((prev) => ({
      ...prev,
      apiTokens: [newToken, ...prev.apiTokens],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
          operator: "Dr. S. Mukherjee",
          action: `Provisioned scoped Bearer token '${newToken.name}'`,
          category: "api",
          ipAddress: "10.244.12.8",
          status: "success",
        },
        ...prev.auditLogs,
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const handleRevokeToken = (tokenId: string) => {
    setConfigState((prev) => ({
      ...prev,
      apiTokens: prev.apiTokens.map((t) => (t.id === tokenId ? { ...t, isRevoked: true } : t)),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
          operator: "Dr. S. Mukherjee",
          action: `Revoked Bearer token [ID: ${tokenId}]`,
          category: "api",
          ipAddress: "10.244.12.8",
          status: "warning",
        },
        ...prev.auditLogs,
      ],
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = () => {
    setSavedSnapshot(configState);
    setHasUnsavedChanges(false);

    setConfigState((prev) => ({
      ...prev,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
          operator: "Dr. S. Mukherjee",
          action: "Saved all system configuration modifications to operational database",
          category: "auth",
          ipAddress: "10.244.12.8",
          status: "success",
        },
        ...prev.auditLogs,
      ],
    }));

    showToast("System settings committed and synchronized across nodes.", "success");
  };

  const handleRevertChanges = () => {
    setConfigState(savedSnapshot);
    setHasUnsavedChanges(false);
    showToast("Reverted input fields to last saved snapshot.", "warning");
  };

  const handleImportState = (imported: SystemSettingsState) => {
    setConfigState(imported);
    setSavedSnapshot(imported);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto flex flex-col gap-3.5 sm:gap-4 pb-12">
      {/* 1. MASTER COMMAND HEADER (Matches AlertsTopBar / MetricsTopBar) */}
      <SettingsTopBar
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveAll}
        onRevert={handleRevertChanges}
        toastMessage={toastMessage}
      />

      {/* 2. SUMMARY METRICS ROW (Matches ScorecardsRow pattern) */}
      <SettingsSummaryRow state={configState} />

      {/* 3. CATEGORY SEGMENTED FILTER BAR */}
      <SettingsNavPills
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 4. MODULAR SETTINGS PANELS */}
      <div className="flex flex-col gap-6 pt-1">
        {/* Section A: Satellite Feeds */}
        {activeCategory === "satellite-feeds" && (
          <div className="animate-in fade-in duration-200">
            <SatelliteFeedsPanel
              mosdac={configState.mosdac}
              noaaS3={configState.noaaS3}
              onUpdateMosdac={handleUpdateMosdac}
              onUpdateNoaaS3={handleUpdateNoaaS3}
              onNotify={showToast}
            />
          </div>
        )}

        {/* Section B: AI Model Engine */}
        {activeCategory === "model-engine" && (
          <div className="animate-in fade-in duration-200">
            <ModelEnginePanel
              checkpoints={configState.checkpoints}
              pinnWeights={configState.pinnWeights}
              hardware={configState.hardware}
              onDeployCheckpoint={handleDeployCheckpoint}
              onUpdatePinnWeights={handleUpdatePinnWeights}
              onUpdateHardware={handleUpdateHardware}
              onNotify={showToast}
            />
          </div>
        )}

        {/* Section C: Disaster Webhooks */}
        {activeCategory === "webhooks" && (
          <div className="animate-in fade-in duration-200">
            <WebhooksPanel
              webhooks={configState.webhooks}
              onUpdateWebhook={handleUpdateWebhook}
              onNotify={showToast}
            />
          </div>
        )}

        {/* Section D: Developer API Hub */}
        {activeCategory === "api-hub" && (
          <div className="animate-in fade-in duration-200">
            <DeveloperApiHub
              apiTokens={configState.apiTokens}
              onGenerateToken={handleGenerateToken}
              onRevokeToken={handleRevokeToken}
              onNotify={showToast}
            />
          </div>
        )}

        {/* Section E: Security & Audit */}
        {activeCategory === "security" && (
          <div className="animate-in fade-in duration-200">
            <SecurityAuditPanel
              auditLogs={configState.auditLogs}
              currentState={configState}
              onImportState={handleImportState}
              onNotify={showToast}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1720px] mx-auto min-h-[60vh] flex items-center justify-center text-[#00F2FE] font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#00F2FE] animate-ping" />
            <span>INITIALIZING SYSTEM SETTINGS &amp; DATA CONNECTORS...</span>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
