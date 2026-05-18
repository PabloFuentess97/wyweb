import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type Props = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  leadId: string;
  appUrl: string;
};

export function LeadNotificationEmail({
  name,
  email,
  phone,
  company,
  message,
  source,
  leadId,
  appUrl,
}: Props) {
  const previewText = `Nuevo lead web: ${name}${company ? ` (${company})` : ''}`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#FAFAF9] font-sans text-[#0E1120] py-10">
          <Container className="max-w-[600px] bg-white border border-[#E7E5E0] rounded-[10px] p-8 mx-auto">
            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[2px] font-semibold text-[#3B5BDB] font-mono">
                NUEVO LEAD WEB
              </Text>
              <Heading className="mt-2 mb-0 text-[24px] font-semibold tracking-[-0.02em] text-[#04060F] leading-tight">
                {name}
                {company && <span className="text-[#525866]"> · {company}</span>}
              </Heading>
              <Text className="mt-1 mb-0 text-[12px] text-[#78716C] font-mono">
                ORIGEN · {source.toUpperCase()} · ID {leadId.slice(0, 8)}
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <DataRow label="Nombre" value={name} />
              <DataRow label="Email" value={email} />
              {phone && <DataRow label="Teléfono" value={phone} />}
              {company && <DataRow label="Empresa" value={company} />}
              <DataRow label="Origen" value={source} />
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[1.5px] font-semibold text-[#525866] font-mono mb-2">
                MENSAJE
              </Text>
              <Text className="m-0 text-[15px] leading-[1.65] text-[#0E1120] whitespace-pre-wrap">
                {message}
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[14px] text-[#525866]">
                Acciones:
              </Text>
              <Text className="mt-2 mb-0 text-[14px]">
                <Link
                  href={`mailto:${email}?subject=Re:%20Tu%20consulta%20a%20Wyweb`}
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  Responder por email
                </Link>
                {phone && (
                  <>
                    {' · '}
                    <Link
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="text-[#3B5BDB] underline-offset-4"
                    >
                      Llamar
                    </Link>
                  </>
                )}
                {' · '}
                <Link
                  href={`${appUrl}/admin/leads`}
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  Ver en backoffice
                </Link>
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Text className="text-[11px] uppercase tracking-[2px] text-[#78716C] font-mono m-0">
              UXEA · GRA · {new Date().getFullYear()}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <Text className="m-0 mb-1.5 text-[14px]">
      <span className="text-[11px] uppercase tracking-[1.5px] text-[#525866] font-mono mr-2">
        {label}
      </span>
      <span className="text-[#0E1120]">{value}</span>
    </Text>
  );
}
