import { entitiesConfig } from '@/lib/entities-config';
import { notFound } from 'next/navigation';
import GenericEntityPage from '@/components/generic-entity-page';

export default async function EntityPage({ params }: { params: { entity: string } }) {
  const config = entitiesConfig[params.entity as keyof typeof entitiesConfig];
  if (!config) return notFound();
  return <GenericEntityPage entity={params.entity} config={config} />;
} 