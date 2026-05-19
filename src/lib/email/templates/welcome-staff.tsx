import {
  Body,
  Button,
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
  setupUrl: string;
  role: string;
  expiresAt: Date;
};

export function WelcomeStaffEmail({ name, setupUrl, role, expiresAt }: Props) {
  const firstName = name.split(' ')[0] ?? name;
  const expiresStr = expiresAt.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido a Wyweb — fija tu contraseña</Preview>
      <Tailwind>
        <Body className="bg-[#FAFAF9] font-sans text-[#0E1120] py-10">
          <Container className="max-w-[600px] bg-white border border-[#E7E5E0] rounded-[10px] p-8 mx-auto">
            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[2px] font-semibold text-[#3B5BDB] font-mono">
                UXEA · BIENVENIDA
              </Text>
              <Heading className="mt-2 mb-0 text-[26px] font-semibold tracking-[-0.025em] text-[#04060F] leading-tight">
                Bienvenido, {firstName}.
              </Heading>
            </Section>

            <Section className="mt-4">
              <Text className="m-0 text-[16px] leading-[1.65] text-[#0E1120]">
                Tu cuenta de <strong>{role}</strong> en Wyweb está lista. Para
                empezar, fija una contraseña pulsando el botón inferior.
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Button
                href={setupUrl}
                className="bg-[#3B5BDB] text-white text-[14px] font-semibold rounded-[6px] px-6 py-3 no-underline"
              >
                Fijar contraseña y entrar
              </Button>
            </Section>

            <Section className="mt-6">
              <Text className="m-0 text-[13px] text-[#525866] leading-[1.65]">
                Si el botón no funciona, copia este enlace en tu navegador:
              </Text>
              <Text className="mt-1 mb-0 text-[12px] font-mono break-all">
                <Link href={setupUrl} className="text-[#3B5BDB] underline-offset-4">
                  {setupUrl}
                </Link>
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[13px] text-[#525866] leading-[1.65]">
                <strong>El enlace caduca el {expiresStr}.</strong> Si tienes dudas o no
                esperabas este correo, escribe a{' '}
                <Link
                  href="mailto:hola@wyweb.net"
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  hola@wyweb.net
                </Link>
                .
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Text className="text-[11px] uppercase tracking-[2px] text-[#78716C] font-mono m-0">
              UXEA · GRUPO UXEA SOLUCIONES SL · GRA · {new Date().getFullYear()}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
