// Utility to inject campaign select and image field into entity config
export function getFullEntityConfig(config: any, apiPath: string, campaigns: any[] = []) {
  // Update campaign_id field if it exists
  let fields = config.fields.map((f: any) => {
    if (f.name === "campaign_id" && f.type === "select") {
      return {
        ...f,
        options: campaigns.map((c: any) => ({ value: c.id, label: c.title })),
      };
    }
    return f;
  });
  // Inject campaign_id if not present and not a campaign
  if (
    apiPath !== "/campaigns" &&
    !fields.some((f: any) => f.name === "campaign_id")
  ) {
    fields = [
      {
        name: "campaign_id",
        label: "Campaign",
        type: "select",
        required: true,
        options: campaigns.map((c: any) => ({ value: c.id, label: c.title })),
      },
      ...fields,
    ];
  }
  // Inject image field if not present AND if config.imageField is not explicitly undefined
  if (config.imageField !== undefined && !fields.some((f: any) => f.name === "image")) {
    fields = [...fields, { name: "image", label: "Image", type: "file" }];
  }
  return {
    ...config,
    api: `/api${apiPath}`,
    fields,
  };
} 