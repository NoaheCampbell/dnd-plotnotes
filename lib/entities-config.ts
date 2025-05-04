export const entitiesConfig = {
  items: {
    label: "Items",
    subtitle: "Manage magical items and artifacts",
    api: "/api/items",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "type", label: "Type", type: "text" },
      { name: "rarity", label: "Rarity", type: "text" },
      { name: "image", label: "Image", type: "file" },
    ],
    imageField: "image_url",
    descriptionField: "rarity",
  },
  npcs: {
    label: "NPCs",
    subtitle: "Your cast of characters across all campaigns",
    api: "/api/npcs",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "type", label: "Type", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "image", label: "Image", type: "file" },
    ],
    imageField: "image_url",
    descriptionField: "type",
  },
  notes: {
    label: "Notes",
    subtitle: "Capture ideas, lore, and everything in between",
    api: "/api/notes",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "content", label: "Content", type: "text" },
    ],
    imageField: undefined,
    descriptionField: "content",
  },
  locations: {
    label: "Locations",
    subtitle: "Track every city, cave, and lair your players visit",
    api: "/api/locations",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "type", label: "Type", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "map", label: "Map", type: "file" },
    ],
    imageField: "map_url",
    descriptionField: "type",
  },
  encounters: {
    label: "Encounters",
    subtitle: "Plan battles, challenges, and enemy groups",
    api: "/api/encounters",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "difficulty", label: "Difficulty", type: "text" },
      { name: "creatures", label: "Number of Creatures", type: "text" },
      { name: "notes", label: "Notes", type: "text" },
    ],
    imageField: undefined,
    descriptionField: "difficulty",
  },
  sessions: {
    label: "Sessions",
    subtitle: "Schedule and review your campaign's sessions",
    api: "/api/sessions",
    fields: [
      { name: "date", label: "Date", type: "date" },
      { name: "time", label: "Time", type: "time" },
      { name: "location", label: "Location", type: "text" },
      { name: "notes", label: "Notes", type: "text" },
    ],
    imageField: undefined,
    descriptionField: "date",
  },
  campaigns: {
    label: "Campaigns",
    subtitle: "Manage your epic adventures and quests",
    api: "/api/campaigns",
    fields: [
      {
        name: "campaign_id",
        label: "Parent Campaign",
        type: "select",
        required: false,
        // options will be injected by EntityActions
      },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "text" },
      { name: "image", label: "Image", type: "file" },
    ],
    imageField: "image_url",
    descriptionField: "description",
  },
  // Add more entities here (campaigns, etc.)
}; 