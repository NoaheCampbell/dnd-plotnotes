import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import EntityActions from "@/components/EntityActions";
import { entitiesConfig } from "@/lib/entities-config";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

function isLongField(fieldName: string) {
  return ["description", "content", "notes"].includes(fieldName.toLowerCase());
}

// Helper to robustly stringify any value for rendering, with logging
function renderValue(val: any, fieldName?: string): string {
  try {
    if (val == null) return "N/A";
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return val.toString();
    if (val instanceof Date) return val.toISOString();
    if (Array.isArray(val)) return val.map(v => renderValue(v, fieldName)).join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  } catch (e) {
    console.error(`Error rendering field '${fieldName}':`, val, e);
    return "Invalid value";
  }
}

export default function GenericEntityGrid({ data, config, campaigns = [], wikiMode = false, onEdit, onDelete }: { data: any[]; config: any; campaigns?: any[]; wikiMode?: boolean; onEdit?: (item: any) => void; onDelete?: (item: any) => void }) {
  // Manage grid data in local state for seamless updates
  const [gridData, setGridData] = useState(data);
  useEffect(() => {
    setGridData(data);
  }, [data]);

  // Track which entity is expanded (wikiMode)
  const [openId, setOpenId] = useState<null | number>(null);
  const [deletingId, setDeletingId] = useState<null | number>(null);
  // Track open long fields per entity (wikiMode)
  const [openFields, setOpenFields] = useState<{ [entityId: number]: string[] }>({});
  const [deleteEntity, setDeleteEntity] = useState<any>(null);

  const toggleField = (entityId: number, fieldName: string) => {
    setOpenFields(prev => {
      const current = prev[entityId] || [];
      return {
        ...prev,
        [entityId]: current.includes(fieldName)
          ? current.filter(f => f !== fieldName)
          : [...current, fieldName],
      };
    });
  };

  // When calling onEdit, add a debug log
  const handleEdit = (item: any) => {
    console.log("Grid onEdit item (original):", item);
    const clonedItem = { ...item }; // Create a shallow clone
    console.log("Grid onEdit item (cloned for non-wikiMode):", clonedItem);
    onEdit && onEdit(clonedItem); // Pass the clone
  };

  if (!gridData.length) {
    return (
      <div className="flex items-center justify-center min-h-[120px] w-full">
        <p className="text-amber-800 dark:text-amber-400 italic text-center w-full">No {config.label.toLowerCase()} found.</p>
      </div>
    );
  }

  if (!wikiMode) {
    // Original grid/card layout
    return (
      <>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {gridData.map((item, idx) => {
            const handleToggleActive = async () => {
              // Optimistically update UI
              const updated = [...gridData];
              updated[idx] = { ...item, active: !item.active };
              setGridData(updated);
              // Call API
              const res = await fetch(`/api/campaigns/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !item.active }),
              });
              if (!res.ok) {
                // Revert if failed
                updated[idx] = item;
                setGridData(updated);
                alert('Failed to update campaign status.');
              }
            };
            const handleDelete = () => {
              setDeleteEntity(item);
            };
            return (
              <div key={item.id} className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 min-w-[260px] max-w-full transition-shadow hover:shadow-lg flex flex-col h-full rounded-md">
                {config.imageField && item[config.imageField] ? (
                  <img
                    src={item[config.imageField]}
                    alt={item[config.fields[0].name]}
                    className="w-full h-40 object-cover rounded-b-none border-b border-amber-800/30"
                  />
                ) : null}
                <div className="flex-grow p-4">
                  <div className="text-amber-900 dark:text-amber-200 font-heading text-lg mb-2">
                    {item.title || item.name || item[config.fields[0].name]}
                  </div>
                  {config.descriptionField && (
                    <div className="text-amber-800 dark:text-amber-400 mb-2">
                      {item[config.descriptionField]}
                    </div>
                  )}
                  <div className="text-sm text-amber-800 dark:text-amber-400 mb-2">
                    {config.fields.filter((f: any) => f.name !== config.imageField && f.name !== "campaign_id" && f.name !== "id").map((f: any) => (
                      <div key={f.name} className="mb-1">
                        <span className="font-semibold">{f.label}:</span>
                        <span className="truncate">
                          {renderValue(item[f.name], f.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full justify-between flex-nowrap p-4 pt-0">
                  {config.label === "Campaigns" && (
                    <Button
                      className={`h-10 min-w-[56px] font-semibold ${item.active ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 hover:bg-gray-500 text-black'}`}
                      onClick={handleToggleActive}
                    >
                      {item.active ? 'Active' : 'Inactive'}
                    </Button>
                  )}
                  <Link href={`/${config.label.toLowerCase()}/${item.id}`}>
                    <Button className="h-10 min-w-[56px] bg-amber-900 hover:bg-amber-800 text-amber-100">View Details</Button>
                  </Link>
                  <Button
                    className="h-10 min-w-[56px] bg-amber-800 text-amber-100 hover:bg-amber-700"
                    onClick={() => {
                      console.log("WikiMode Edit clicked for item (original):", item);
                      const clonedItem = { ...item }; // Create a shallow clone
                      console.log("WikiMode Edit item (cloned):", clonedItem);
                      onEdit && onEdit(clonedItem); // Pass the clone
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="h-10 min-w-[56px] bg-red-900 text-amber-100 hover:bg-red-800"
                    onClick={handleDelete}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                <EntityActions
                  entity={item}
                  config={entitiesConfig[config.label.toLowerCase() as keyof typeof entitiesConfig]}
                  apiPath={`/${config.label.toLowerCase()}`}
                  editOpen={false}
                  setEditOpen={() => {}}
                  deleteOpen={false}
                  setDeleteOpen={() => {}}
                  deleting={deletingId === item.id}
                  setDeleting={v => setDeletingId(v ? item.id : null)}
                  campaigns={campaigns}
                />
              </div>
            );
          })}
        </div>
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteEntity} onOpenChange={v => { if (!v) setDeleteEntity(null); }}>
          <DialogContent className="bg-parchment-light dark:bg-stone-800 border-amber-800/20">
            <DialogHeader>
              <DialogTitle className="text-amber-900 dark:text-amber-200">
                Delete {config.label.slice(0, -1)}
              </DialogTitle>
            </DialogHeader>
            <p className="text-amber-800 dark:text-amber-400 mb-4">
              Are you sure you want to delete "{deleteEntity?.title || deleteEntity?.name}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={async () => {
                  setDeletingId(deleteEntity.id);
                  await fetch(`/api/${config.label.toLowerCase()}/${deleteEntity.id}`, { method: "DELETE" });
                  setGridData(prev => prev.filter(e => e.id !== deleteEntity.id));
                  setDeletingId(null);
                  setDeleteEntity(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Wiki/accordion mode (for campaign details page)
  return (
    <div className="flex flex-col gap-4 w-full">
      {gridData.map((item) => {
        const isOpen = openId === item.id;
        const entityFields = config.fields.filter((f: any) => f.name !== "id" && f.type !== "file");
        return (
          <div key={item.id} className="border border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20 rounded-md overflow-hidden">
            {/* Header */}
            <button
              className={`w-full text-left px-4 py-3 font-heading text-lg text-amber-900 dark:text-amber-200 bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition flex items-center justify-between`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <span>{item.title || item.name || item[config.fields[0].name]}</span>
              <span className="ml-2 text-amber-700 dark:text-amber-400 text-xl">{isOpen ? "▴" : "▾"}</span>
            </button>
            {/* Collapsible details */}
            {isOpen && (
              <div className="px-6 py-5 bg-amber-50/60 dark:bg-stone-900/40">
                {/* Image at the top if present */}
                {config.imageField && item[config.imageField] && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={item[config.imageField]}
                      alt={item.title || item.name || "Image"}
                      className="w-48 h-48 object-cover rounded border border-amber-800/30 shadow-md"
                    />
                  </div>
                )}
                {/* Fields displayed in a two-column grid */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {(config.preview?.enabled && config.preview?.fields && config.preview.fields.length > 0
                      ? config.preview.fields
                      : entityFields
                    ).map((f: any) => (
                      <div key={f.name} className="flex flex-col">
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-0.5">{f.label}</span>
                        <span className="text-amber-900 dark:text-amber-300 whitespace-pre-line break-words">
                        {renderValue(item[f.name], f.name)}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-amber-800/10 dark:border-amber-800/20">
                  <Link href={`/${config.label.toLowerCase()}/${item.id}`}>
                    <Button className="bg-amber-900 hover:bg-amber-800 text-amber-100">View Details</Button>
                  </Link>
                  <Button
                    className="bg-amber-800 text-amber-100 hover:bg-amber-700"
                    onClick={() => {
                      console.log("WikiMode Edit clicked for item (original):", item);
                      const clonedItem = { ...item }; // Create a shallow clone
                      console.log("WikiMode Edit item (cloned):", clonedItem);
                      onEdit && onEdit(clonedItem); // Pass the clone
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="bg-red-900 text-amber-100 hover:bg-red-800"
                    onClick={() => onDelete && onDelete(item)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                <EntityActions
                  entity={item}
                  config={entitiesConfig[config.label.toLowerCase() as keyof typeof entitiesConfig]}
                  apiPath={`/${config.label.toLowerCase()}`}
                  editOpen={false}
                  setEditOpen={() => {}}
                  deleteOpen={false}
                  setDeleteOpen={() => {}}
                  deleting={deletingId === item.id}
                  setDeleting={v => setDeletingId(v ? item.id : null)}
                  campaigns={campaigns}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}