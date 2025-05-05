import { entitiesConfig } from '@/lib/entities-config';
import { notFound } from 'next/navigation';
import GenericEntityPage from '@/components/generic-entity-page';

export default async function EntityPage({ params }: { params: { entity: string } }) {
  const awaitedParams = await params;
  const config = entitiesConfig[awaitedParams.entity as keyof typeof entitiesConfig];
  if (!config) return notFound();
  return <GenericEntityPage entity={awaitedParams.entity} config={config} />;
} 