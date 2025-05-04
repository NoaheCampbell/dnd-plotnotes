import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

export default function GenericEntityForm({ open, setOpen, config, onCreated, campaigns = [] }: { open: boolean; setOpen: (v: boolean) => void; config: any; onCreated: (item: any) => void; campaigns?: any[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  // Inject campaign_id select field for non-campaign entities
  const fields = [
    ...(config.label !== "Campaigns"
      ? [{
          name: "campaign_id",
          label: "Campaign",
          type: "select",
          required: true,
          options: campaigns.map((c: any) => ({ value: c.id, label: c.title }))
        }]
      : []),
    ...config.fields
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch(config.api, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setOpen(false);
      form.reset();
      const newItem = await res.json();
      onCreated(newItem);
    } else {
      alert("Failed to add " + config.label.slice(0, -1));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">
            Add {config.label.slice(0, -1)}
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field: any) => (
            <div className="space-y-2" key={field.name}>
              <Label htmlFor={field.name} className="text-amber-900 dark:text-amber-200">{field.label}</Label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  required={field.required}
                  defaultValue=""
                  className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30 rounded px-3 py-2 w-full"
                >
                  <option value="" disabled>
                    Select a campaign
                  </option>
                  {field.options?.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30"
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className="text-amber-900 dark:text-amber-200 px-4 py-2 rounded border border-amber-800/30 bg-transparent">Cancel</button>
            </DialogClose>
            <button type="submit" className="bg-red-900 hover:bg-red-800 text-amber-100 px-4 py-2 rounded">Add</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 