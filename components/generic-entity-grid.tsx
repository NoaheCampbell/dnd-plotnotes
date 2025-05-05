import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import EntityActions from "@/components/EntityActions";
import { entitiesConfig } from "@/lib/entities-config";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function GenericEntityGrid({ data, config, campaigns = [] }: { data: any[]; config: any; campaigns?: any[] }) {
  // Manage grid data in local state for seamless updates
  const [gridData, setGridData] = useState(data);
  useEffect(() => {
    setGridData(data);
  }, [data]);

  // Modal state for edit/delete
  const [editOpenId, setEditOpenId] = useState<null | number>(null);
  const [deleteOpenId, setDeleteOpenId] = useState<null | number>(null);
  const [deletingId, setDeletingId] = useState<null | number>(null);

  if (!gridData.length) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-amber-800 dark:text-amber-400 italic">No {config.label.toLowerCase()} found.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        return (
          <Card key={item.id} className="overflow-hidden border-amber-800/30 bg-parchment-light dark:bg-stone-800 dark:border-amber-800/20">
            {config.imageField && item[config.imageField] ? (
              <img
                src={item[config.imageField]}
                alt={item[config.fields[0].name]}
                className="w-full h-auto rounded border border-amber-800/30"
              />
            ) : null}
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-200 font-heading">
                {item.title || item.name || item[config.fields[0].name]}
              </CardTitle>
              {config.descriptionField && (
                <CardDescription className="text-amber-800 dark:text-amber-400">
                  {item[config.descriptionField]}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="text-sm text-amber-800 dark:text-amber-400">
              {config.label === "Campaigns" && (
                <div className="space-y-1">
                  <p>Players: {item.players_count || 0}</p>
                  <p>Sessions: {item.sessions_count || 0}</p>
                  {item.last_played && (
                    <p>Last played: {new Date(item.last_played).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex items-stretch gap-2 w-full mt-2 flex-nowrap justify-start overflow-x-auto">
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
                  onClick={() => setEditOpenId(item.id)}
                >
                  Edit
                </Button>
                <Button
                  className="h-10 min-w-[56px] bg-red-900 text-amber-100 hover:bg-red-800"
                  onClick={() => setDeleteOpenId(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
              <EntityActions
                entity={item}
                config={entitiesConfig[config.label.toLowerCase() as keyof typeof entitiesConfig]}
                apiPath={`/${config.label.toLowerCase()}`}
                editOpen={editOpenId === item.id}
                setEditOpen={v => setEditOpenId(v ? item.id : null)}
                deleteOpen={deleteOpenId === item.id}
                setDeleteOpen={v => setDeleteOpenId(v ? item.id : null)}
                deleting={deletingId === item.id}
                setDeleting={v => setDeletingId(v ? item.id : null)}
                campaigns={campaigns}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}