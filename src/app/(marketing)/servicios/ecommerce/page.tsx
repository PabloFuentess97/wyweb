import type { Metadata } from 'next';
import { ServicePageTemplate } from '@/components/marketing/service-page-template';
import { services } from '@/lib/data/services';

const service = services.ecommerce;

export const metadata: Metadata = {
  title: service.metadata.title,
  description: service.metadata.description,
  alternates: { canonical: `/servicios/${service.slug}` },
};

export default function EcommercePage() {
  return <ServicePageTemplate service={service} />;
}
