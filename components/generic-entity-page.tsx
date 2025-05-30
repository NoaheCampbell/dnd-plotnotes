"use client";
import { useEffect, useState } from "react";
import GenericEntityGrid from "./generic-entity-grid";
import GenericEntityForm from "./generic-entity-form";
import { Input } from "@/components/ui/input";
import { getFullEntityConfig } from "@/lib/get-full-entity-config";

export default function GenericEntityPage({ entity, config }: { entity: string; config: any }) {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [allNpcs, setAllNpcs] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [allEncounters, setAllEncounters] = useState<any[]>([]);

  useEffect(() => {
    fetch(config.api)
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }
        const text = await res.text();
        if (!text) return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(setData)
      .catch(() => setData([]));
    if (entity !== "campaigns") {
      fetch("/api/campaigns")
        .then(async (res) => res.ok ? res.json() : [])
        .then(setCampaigns)
        .catch(() => setCampaigns([]));
      fetch("/api/locations")
        .then(async (res) => res.ok ? res.json() : [])
        .then(setLocations)
        .catch(() => setLocations([]));
      if (entity === "notes") {
        fetch("/api/npcs").then(res => res.ok ? res.json() : []).then(setAllNpcs).catch(() => setAllNpcs([]));
        fetch("/api/items").then(res => res.ok ? res.json() : []).then(setAllItems).catch(() => setAllItems([]));
        fetch("/api/encounters").then(res => res.ok ? res.json() : []).then(setAllEncounters).catch(() => setAllEncounters([]));
      }
    }
  }, [config.api, entity]);

  const handleCreated = (newItem: any) => {
    setData((prevData) => {
      const isUpdate = prevData.some(item => item.id === newItem.id);
      if (isUpdate) {
        return prevData.map(item => (item.id === newItem.id ? newItem : item));
      } else {
        return [...prevData, newItem];
      }
    });
    if (editEntity && editEntity.id === newItem.id) {
        setEditEntity(null);
    }
  };

  const searchField = config.fields.find((f: any) => f.type === "text");
  const filteredData = searchField
    ? data.filter((item) =>
        (item[searchField.name] || "").toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-amber-900 dark:text-amber-200">
              {config.label}
            </h1>
            {config.subtitle && (
              <p className="text-amber-800 dark:text-amber-400 italic text-xl mt-1">
                {config.subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="search"
                placeholder={`Search ${config.label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] pl-8 md:w-[260px] rounded-full bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
              />
            </div>
            <button className="bg-red-900 hover:bg-red-800 text-amber-100 rounded px-4 py-2" onClick={() => setOpen(true)}>
              New {config.label.slice(0, -1)}
            </button>
          </div>
        </div>
        <GenericEntityGrid data={filteredData} config={config} campaigns={campaigns} onEdit={setEditEntity} />
        <GenericEntityForm
          open={open || !!editEntity}
          setOpen={(v) => { if (!v) { setOpen(false); setEditEntity(null); } }}
          config={getFullEntityConfig(config, `/${entity}`, campaigns)}
          onCreated={handleCreated}
          campaigns={campaigns}
          entity={editEntity || undefined}
          availableLocations={locations}
          allNpcs={allNpcs}
          allItems={allItems}
          allEncounters={allEncounters}
        />
      </div>
    </div>
  );
} 