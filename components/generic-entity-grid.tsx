import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import EntityActions from "@/components/EntityActions";
import { entitiesConfig } from "@/lib/entities-config";

export default function GenericEntityGrid({ data, config }: { data: any[]; config: any }) {
  if (!data.length) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-amber-800 dark:text-amber-400 italic">No {config.label.toLowerCase()} found.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
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
              {item[config.fields[0].name]}
            </CardTitle>
            {config.descriptionField && (
              <CardDescription className="text-amber-800 dark:text-amber-400">
                {item[config.descriptionField]}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="text-sm text-amber-800 dark:text-amber-400">
            {/* Optionally render more fields here */}
          </CardContent>
          <CardFooter>
            <Link href={`/${config.label.toLowerCase()}/${item.id}`} className="w-full">
              <button className="w-full border-amber-800/30 text-amber-900 hover:bg-amber-100/50 hover:text-amber-900 dark:border-amber-800/20 dark:text-amber-200 dark:hover:bg-amber-900/30 dark:hover:text-amber-200 rounded border px-4 py-2">
                View Details
              </button>
            </Link>
            <EntityActions
              entity={item}
              config={entitiesConfig[config.label.toLowerCase() as keyof typeof entitiesConfig]}
              apiPath={`/${config.label.toLowerCase()}`}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}