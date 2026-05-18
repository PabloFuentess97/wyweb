import type { Metadata } from 'next';
import { LegalLayout, legalNav } from '@/components/marketing/legal-layout';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description:
    'Información sobre el uso de cookies y tecnologías similares en wyweb.es.',
  alternates: { canonical: '/legal/cookies' },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  const related = legalNav.map((n) => ({ ...n, current: n.href === '/legal/cookies' }));
  return (
    <LegalLayout
      number="03"
      eyebrow="LSSI · ART. 22.2"
      title="Política de cookies"
      lastUpdated="1 de mayo de 2026"
      intro="Información transparente sobre las cookies y tecnologías similares utilizadas en wyweb.es. Diseñamos el sitio para minimizar el uso de cookies — no necesitas aceptar nada para navegar."
      related={related}
    >
      <h2>1. Qué es una cookie</h2>
      <p>
        Una <strong>cookie</strong> es un pequeño fichero de texto que un sitio web
        almacena en tu dispositivo (ordenador, móvil, tablet) cuando lo visitas. Permiten
        que el sitio recuerde información sobre tu visita, como tus preferencias de
        idioma o el modo claro/oscuro, entre otras finalidades.
      </p>

      <h2>2. Nuestro enfoque</h2>
      <p>
        En <strong>wyweb.es</strong> aplicamos el principio de minimización: solo usamos
        cookies estrictamente necesarias para el funcionamiento del sitio y para que
        recuerde tus preferencias. <strong>No utilizamos cookies de marketing,
        publicidad, perfilado ni de seguimiento de terceros.</strong>
      </p>
      <p>
        Para las métricas de uso utilizamos <strong>Plausible Analytics</strong>{' '}
        autohospedado en nuestra infraestructura europea, que funciona{' '}
        <strong>sin cookies</strong> y sin recopilar datos personales identificables. Por
        este motivo, conforme al artículo 22.2 LSSI, no es necesario solicitar tu
        consentimiento para nuestras cookies técnicas y de personalización.
      </p>

      <h2>3. Cookies que utilizamos</h2>

      <h3>3.1 Cookies técnicas (estrictamente necesarias)</h3>
      <dl>
        <dt>Nombre</dt>
        <dd>
          <code>theme</code>
        </dd>
        <dt>Tipo</dt>
        <dd>Local Storage (no es cookie HTTP estricto, se equipara funcionalmente)</dd>
        <dt>Finalidad</dt>
        <dd>
          Recordar tu preferencia de tema visual (claro/oscuro/sistema). Evita el
          parpadeo (FOUC) en cargas posteriores.
        </dd>
        <dt>Duración</dt>
        <dd>Persistente hasta que la borres manualmente.</dd>
        <dt>Tercero</dt>
        <dd>Ninguno — almacenamiento local en tu navegador.</dd>
      </dl>

      <h3>3.2 Cookies de sesión (área cliente y backoffice)</h3>
      <p>
        Si accedes al área cliente o al backoffice, utilizamos cookies de sesión
        estrictamente necesarias para mantenerte autenticado. Estas cookies son{' '}
        <code>HttpOnly</code> + <code>Secure</code> + <code>SameSite=Lax</code>, no se
        comparten con terceros y se eliminan al cerrar sesión o expirar.
      </p>
      <dl>
        <dt>Nombre</dt>
        <dd>
          <code>__Secure-next-auth.session-token</code>
        </dd>
        <dt>Finalidad</dt>
        <dd>Mantener tu sesión iniciada.</dd>
        <dt>Duración</dt>
        <dd>30 días renovables o hasta cierre de sesión.</dd>
        <dt>Tercero</dt>
        <dd>Ninguno — gestionada por nuestro propio sistema de autenticación.</dd>
      </dl>

      <h3>3.3 Lo que NO usamos</h3>
      <ul>
        <li>Cookies de marketing o publicidad.</li>
        <li>Cookies de redes sociales o widgets externos.</li>
        <li>Píxeles de tracking de terceros (Google Ads, Meta, etc.).</li>
        <li>Identificadores publicitarios o de huella digital.</li>
        <li>Servicios de analítica de terceros con cookies (Google Analytics, etc.).</li>
      </ul>

      <h2>4. Cómo gestionar las cookies</h2>
      <p>
        Puedes configurar o eliminar las cookies y el almacenamiento local desde tu
        navegador. Cada navegador ofrece instrucciones específicas:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/es/kb/Borrar%20cookies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/es-es/microsoft-edge"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>
      <p>
        Si bloqueas las cookies técnicas, ciertas funcionalidades como el tema visual o
        la sesión del área cliente pueden dejar de funcionar correctamente.
      </p>

      <h2>5. Modificaciones</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios técnicos o legislativos.
        Te recomendamos consultarla periódicamente. La fecha de última actualización
        figura al inicio de este documento.
      </p>

      <h2>6. Contacto</h2>
      <p>
        Para cualquier consulta sobre esta política, escríbenos a{' '}
        <a href="mailto:privacidad@wyweb.es">privacidad@wyweb.es</a>.
      </p>
    </LegalLayout>
  );
}
