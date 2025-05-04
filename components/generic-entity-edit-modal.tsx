import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function GenericEntityEditModal({
  open,
  setOpen,
  config,
  entity,
  onEdited,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  config: any;
  entity: any;
  onEdited: (item: any) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch(`${config.api}/${entity.id}`, {
      method: "PATCH",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      form.reset();
      const updated = await res.json();
      onEdited(updated);
      router.refresh();
    } else {
      alert("Failed to update " + config.label.slice(0, -1));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg bg-parchment-light dark:bg-stone-800 border-amber-800/20">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-200 font-heading text-xl">
            Edit {config.label.slice(0, -1)}
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field: any) => (
            <div className="space-y-2" key={field.name}>
              <Label htmlFor={field.name} className="text-amber-900 dark:text-amber-200">{field.label}</Label>
              <Input
                name={field.name}
                type={field.type}
                required={field.required}
                defaultValue={entity[field.name] || ""}
                className="bg-amber-50/50 border-amber-800/30 dark:bg-amber-900/20 dark:border-amber-800/30"
              />
            </div>
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <button type="button" className="text-amber-900 dark:text-amber-200 px-4 py-2 rounded border border-amber-800/30 bg-transparent">Cancel</button>
            </DialogClose>
            <button type="submit" className="bg-red-900 hover:bg-red-800 text-amber-100 px-4 py-2 rounded" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 