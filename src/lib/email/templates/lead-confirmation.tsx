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
  appUrl: string;
};

export function LeadConfirmationEmail({ name, appUrl }: Props) {
  const firstName = name.split(' ')[0] ?? name;

  return (
    <Html lang="es">
      <Head />
      <Preview>Hemos recibido tu mensaje. Te respondemos en 24h hábiles.</Preview>
      <Tailwind>
        <Body className="bg-[#FAFAF9] font-sans text-[#0E1120] py-10">
          <Container className="max-w-[600px] bg-white border border-[#E7E5E0] rounded-[10px] p-8 mx-auto">
            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[2px] font-semibold text-[#3B5BDB] font-mono">
                UXEA · MENSAJE RECIBIDO
              </Text>
              <Heading className="mt-2 mb-0 text-[28px] font-semibold tracking-[-0.025em] text-[#04060F] leading-tight">
                Gracias, {firstName}.
              </Heading>
            </Section>

            <Section className="mt-4">
              <Text className="m-0 text-[16px] leading-[1.65] text-[#0E1120]">
                Tu mensaje ha llegado al equipo de Wyweb. Lo leemos en cuanto
                podamos y te respondemos personalmente, normalmente <strong>en menos de
                24 horas hábiles</strong>.
              </Text>
              <Text className="mt-3 mb-0 text-[16px] leading-[1.65] text-[#0E1120]">
                Si lo prefieres, puedes escribirnos directamente a{' '}
                <Link
                  href="mailto:hola@wyweb.net"
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  hola@wyweb.net
                </Link>{' '}
                o llamarnos al <strong>+34 958 000 000</strong>.
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[1.5px] font-semibold text-[#525866] font-mono">
                MIENTRAS TANTO
              </Text>
              <Text className="mt-2 mb-0 text-[15px] leading-[1.65] text-[#0E1120]">
                Si quieres profundizar en lo que hacemos:
              </Text>
              <Text className="mt-2 mb-0 text-[15px]">
                <Link
                  href={`${appUrl}/servicios`}
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  Ver servicios
                </Link>
                {' · '}
                <Link
                  href={`${appUrl}/grupo`}
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  Sobre el grupo
                </Link>
                {' · '}
                <Link
                  href={`${appUrl}/blog`}
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  Blog técnico
                </Link>
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Text className="text-[11px] uppercase tracking-[2px] text-[#78716C] font-mono m-0">
              UXEA · GRUPO UXEA SOLUCIONES SL · GRANADA · ES
            </Text>
            <Text className="mt-1 text-[11px] text-[#78716C] m-0">
              Recibes este email porque has rellenado el formulario en wyweb.net.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
