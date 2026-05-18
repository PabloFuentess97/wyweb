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
  authorName: string;
  authorRole: 'staff' | 'client';
  recipientName: string;
  ticketUrl: string;
};

export function TicketReplyEmail({
  number,
  subject,
  body,
  authorName,
  authorRole,
  recipientName,
  ticketUrl,
}: Props) {
  const firstName = recipientName.split(' ')[0] ?? recipientName;
  const fromLabel = authorRole === 'staff' ? 'Equipo Wyweb' : 'Cliente';

  return (
    <Html lang="es">
      <Head />
      <Preview>
        Nueva respuesta en {number} de {authorName}
      </Preview>
      <Tailwind>
        <Body className="bg-[#FAFAF9] font-sans text-[#0E1120] py-10">
          <Container className="max-w-[600px] bg-white border border-[#E7E5E0] rounded-[10px] p-8 mx-auto">
            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[2px] font-semibold text-[#3B5BDB] font-mono">
                TICKET · NUEVA RESPUESTA
              </Text>
              <Heading className="mt-2 mb-0 text-[22px] font-semibold tracking-[-0.02em] text-[#04060F] leading-tight">
                {number}
              </Heading>
              <Text className="mt-1 mb-0 text-[14px] text-[#525866]">{subject}</Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[16px] leading-[1.65] text-[#0E1120]">
                Hola {firstName}, hay una respuesta nueva de{' '}
                <strong>{authorName}</strong> ({fromLabel}):
              </Text>
            </Section>

            <Section className="mt-4 rounded-[6px] border-l-2 border-l-[#3B5BDB] pl-4 bg-[#FAFAF9] py-2">
              <Text className="m-0 text-[15px] leading-[1.65] text-[#0E1120] whitespace-pre-wrap">
                {body}
              </Text>
            </Section>

            <Section className="mt-6">
              <Link
                href={ticketUrl}
                className="text-[#3B5BDB] underline-offset-4 font-medium text-[14px]"
              >
                Ver el ticket →
              </Link>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Text className="text-[11px] uppercase tracking-[2px] text-[#78716C] font-mono m-0">
              UXEA · NO RESPONDAS A ESTE EMAIL · USA EL TICKET
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
