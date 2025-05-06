import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GenericEntityForm({ 
  open, 
  setOpen, 
  config, 
  onCreated, 
  campaigns = [],
  entity
}: { 
  open: boolean; 
  setOpen: (v: boolean) => void; 
  config: any; 
  onCreated: (item: any) => void; 
  campaigns?: any[];
  entity?: any;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fields = config.fields;

  // Pre-fill form with entity data if editing
  useEffect(() => {
    if (formRef.current) {
      if (entity && open) {
        fields.forEach((field: any) => {
          const input = formRef.current?.elements.namedItem(field.name) as HTMLInputElement;
          if (input) {
            if (field.type === "select") {
              input.value = entity[field.name] || '';
            } else {
              input.value = entity?.[field.name] instanceof Date
                ? entity[field.name].toISOString()
                : entity?.[field.name] || '';
            }
          }
        });
        setIsInitialized(true);
      } else if (!open) {
        formRef.current.reset();
        setIsInitialized(false);
      }
    }
  }, [entity, open, fields]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const isEdit = entity && entity.id;
    const url = isEdit ? `${config.api}/${entity.id}` : config.api;
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(
      url,
      {
        method,
        body: formData,
      }
    );
    
    if (res.ok) {
      setOpen(false);
      form.reset();
      const newItem = await res.json();
      onCreated(newItem);
    } else {
      alert(`Failed to ${entity ? 'update' : 'add'} ${config.label.slice(0, -1)}`);
    }
  };

  // Group fields by row based on layout
  const groupedFields = fields.reduce((acc: any[], field: any) => {
    const lastGroup = acc[acc.length - 1];
    const width = field.layout?.width || "full";
    
    if (width === "full" || !lastGroup || lastGroup.some((f: any) => f.layout?.width === "full")) {
      acc.push([field]);
    } else {
      const currentWidth = lastGroup.reduce((sum: number, f: any) => {
        const w = f.layout?.width || "full";
        return sum + (w === "half" ? 0.5 : w === "third" ? 0.33 : 1);
      }, 0);
      
      if (currentWidth + (width === "half" ? 0.5 : width === "third" ? 0.33 : 1) <= 1) {
        lastGroup.push(field);
      } else {
        acc.push([field]);
      }
    }
    return acc;
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl bg-parchment-light dark:bg-stone-800 border-amber-800/20 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">
            {entity ? 'Edit' : 'Add'} {config.label.slice(0, -1)}
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {groupedFields.map((row: any[], rowIndex: number) => (
              <div key={rowIndex} className="flex gap-4">
                {row.map((field: any) => (
                  <div 
                    key={field.name} 
                    className={`space-y-2 ${
                      field.layout?.width === "half" ? "w-1/2" :
                      field.layout?.width === "third" ? "w-1/3" :
                      "w-full"
                    }`}
                  >
                    <Label htmlFor={field.name} className="text-amber-900 dark:text-amber-200">
                      {field.label}
                    </Label>
                    {field.type === "text" && (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        required={field.required}
                        defaultValue={
                          entity?.[field.name] instanceof Date
                            ? entity[field.name].toISOString()
                            : entity?.[field.name] || ''
                        }
                        className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                      />
                    )}
                    {field.type === "longtext" && (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        defaultValue={entity?.[field.name] || ''}
                        rows={field.layout?.rows || 3}
                        className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                      />
                    )}
                    {field.type === "date" && (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        required={field.required}
                        defaultValue={
                          entity?.[field.name]
                            ? entity[field.name] instanceof Date
                              ? entity[field.name].toISOString().slice(0, 10)
                              : typeof entity[field.name] === "string"
                                ? entity[field.name].slice(0, 10)
                                : ""
                            : ""
                        }
                        className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                      />
                    )}
                    {field.type === "select" && (
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        defaultValue={entity?.[field.name] || ''}
                        className="w-full rounded-md border border-amber-800/30 bg-amber-50/50 px-3 py-2 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option: any) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === "file" && (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept="image/*"
                        className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                      />
                    )}
                    {field.type === "time" && (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="time"
                        required={field.required}
                        defaultValue={entity?.[field.name] || ''}
                        className="bg-amber-50/50 border-amber-800/30 text-amber-900 placeholder:text-amber-700/50 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200 dark:placeholder:text-amber-600/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4 pt-4 border-t border-amber-800/20">
            <DialogClose asChild>
              <Button variant="outline" className="text-amber-900 dark:text-amber-200 border-amber-800/30">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-amber-800 text-amber-100 hover:bg-amber-700">
              {entity ? 'Update' : 'Add'} {config.label.slice(0, -1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 