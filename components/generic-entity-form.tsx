import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

  // Remove campaign_id select field injection here. Only use config.fields.
  const fields = config.fields;

  // Pre-fill form with entity data if editing
  useEffect(() => {
    if (formRef.current) {
      if (entity && open) {
        // Set form values when editing
        fields.forEach((field: any) => {
          const input = formRef.current?.elements.namedItem(field.name) as HTMLInputElement;
          if (input) {
            if (field.type === "select") {
              // For select fields, set the value directly
              input.value = entity[field.name] || '';
            } else {
              // For other fields, set the value
              input.value = entity[field.name] || '';
            }
          }
        });
        setIsInitialized(true);
      } else if (!open) {
        // Reset form when dialog closes
        formRef.current.reset();
        setIsInitialized(false);
      }
    }
  }, [entity, open, fields]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const res = await fetch(
      entity ? `${config.api}/${entity.id}` : config.api,
      {
        method: entity ? "PATCH" : "POST",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">
            {entity ? 'Edit' : 'Add'} {config.label.slice(0, -1)}
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field: any) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-amber-900 dark:text-amber-200">
                {field.label}
              </Label>
              {field.type === "text" && (
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  required={field.required}
                  defaultValue={entity?.[field.name] || ''}
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
            </div>
          ))}
          <DialogFooter>
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