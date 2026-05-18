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
  number: string;
  subject: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  customerName: string;
  openedByName: string;
  serviceName?: string;
  appUrl: string;
  ticketId: string;
};

const PRIORITY_LABEL = {
  low: 'BAJA',
  normal: 'NORMAL',
  high: 'ALTA',
  critical: 'CRÍTICA',
} as const;

const PRIORITY_COLOR = {
  low: '#525866',
  normal: '#3B5BDB',
  high: '#E8590C',
  critical: '#C92A2A',
} as const;

export function TicketCreatedStaffEmail({
  number,
  subject,
  body,
  priority,
  customerName,
  openedByName,
  serviceName,
  appUrl,
  ticketId,
}: Props) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Nuevo ticket {number} · {priority.toUpperCase()} · {customerName}
      </Preview>
      <Tailwind>
        <Body className="bg-[#FAFAF9] font-sans text-[#0E1120] py-10">
          <Container className="max-w-[600px] bg-white border border-[#E7E5E0] rounded-[10px] p-8 mx-auto">
            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[2px] font-semibold font-mono"
                    style={{ color: PRIORITY_COLOR[priority] }}>
                NUEVO TICKET · PRIORIDAD {PRIORITY_LABEL[priority]}
              </Text>
              <Heading className="mt-2 mb-0 text-[24px] font-semibold tracking-[-0.02em] text-[#04060F] leading-tight">
                {number} · {subject}
              </Heading>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Row label="Cliente" value={customerName} />
              <Row label="Abierto por" value={openedByName} />
              {serviceName && <Row label="Servicio" value={serviceName} />}
              <Row label="Prioridad" value={PRIORITY_LABEL[priority]} />
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[1.5px] font-semibold text-[#525866] font-mono mb-2">
                MENSAJE INICIAL
              </Text>
              <Text className="m-0 text-[15px] leading-[1.65] text-[#0E1120] whitespace-pre-wrap">
                {body}
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[14px]">
                <Link
                  href={`${appUrl}/admin/tickets/${ticketId}`}
                  className="text-[#3B5BDB] underline-offset-4 font-medium"
                >
                  Abrir en backoffice →
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text className="m-0 mb-1.5 text-[14px]">
      <span className="text-[11px] uppercase tracking-[1.5px] text-[#525866] font-mono mr-2">
        {label}
      </span>
      <span className="text-[#0E1120]">{value}</span>
    </Text>
  );
}
