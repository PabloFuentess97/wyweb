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
  resetUrl: string;
  expiresAt: Date;
};

export function PasswordResetEmail({ name, resetUrl, expiresAt }: Props) {
  const firstName = name.split(' ')[0] ?? name;
  const expiresStr = expiresAt.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Html lang="es">
      <Head />
      <Preview>Restablece tu contraseña en Wyweb</Preview>
      <Tailwind>
        <Body className="bg-[#FAFAF9] font-sans text-[#0E1120] py-10">
          <Container className="max-w-[600px] bg-white border border-[#E7E5E0] rounded-[10px] p-8 mx-auto">
            <Section>
              <Text className="m-0 text-[11px] uppercase tracking-[2px] font-semibold text-[#3B5BDB] font-mono">
                UXEA · CONTRASEÑA
              </Text>
              <Heading className="mt-2 mb-0 text-[26px] font-semibold tracking-[-0.025em] text-[#04060F] leading-tight">
                Restablece tu contraseña, {firstName}.
              </Heading>
            </Section>

            <Section className="mt-4">
              <Text className="m-0 text-[16px] leading-[1.65] text-[#0E1120]">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta
                en Wyweb. Pulsa el botón inferior para fijar una nueva.
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Button
                href={resetUrl}
                className="bg-[#0E1120] text-white text-[14px] font-semibold rounded-[6px] px-6 py-3 no-underline"
              >
                Restablecer contraseña
              </Button>
            </Section>

            <Section className="mt-6">
              <Text className="m-0 text-[13px] text-[#525866] leading-[1.65]">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </Text>
              <Text className="mt-1 mb-0 text-[12px] font-mono break-all">
                <Link href={resetUrl} className="text-[#3B5BDB] underline-offset-4">
                  {resetUrl}
                </Link>
              </Text>
            </Section>

            <Hr className="my-6 border-[#E7E5E0]" />

            <Section>
              <Text className="m-0 text-[13px] text-[#525866] leading-[1.65]">
                <strong>El enlace caduca el {expiresStr}.</strong> Si no fuiste tú quien
                solicitó este cambio, ignora este correo y avísanos en{' '}
                <Link
                  href="mailto:hola@wyweb.es"
                  className="text-[#3B5BDB] underline-offset-4"
                >
                  hola@wyweb.es
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
