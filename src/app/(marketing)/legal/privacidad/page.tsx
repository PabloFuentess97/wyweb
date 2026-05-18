import type { Metadata } from 'next';
import { LegalLayout, legalNav } from '@/components/marketing/legal-layout';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Información sobre el tratamiento de datos personales por Wyweb conforme al RGPD y la LOPDGDD.',
  alternates: { canonical: '/legal/privacidad' },
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  const related = legalNav.map((n) => ({ ...n, current: n.href === '/legal/privacidad' }));
  return (
    <LegalLayout
      number="02"
      eyebrow="RGPD · LOPDGDD"
      title="Política de privacidad"
      lastUpdated="1 de mayo de 2026"
      intro="Cómo tratamos tus datos personales en wyweb.es en cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD)."
      related={related}
    >
      <h2>1. Responsable del tratamiento</h2>
      <dl>
        <dt>Identidad</dt>
        <dd>Wyweb (datos identificativos en /admin/ajustes)</dd>
        <dt>Domicilio</dt>
        <dd>
          <address>
            España · 100% remoto
          </address>
        </dd>
        <dt>Email</dt>
        <dd>
          <a href="mailto:hola@wyweb.es">hola@wyweb.es</a>
        </dd>
        <dt>Email para asuntos de privacidad</dt>
        <dd>
          <a href="mailto:privacidad@wyweb.es">privacidad@wyweb.es</a>
        </dd>
      </dl>

      <h2>2. Datos que tratamos</h2>
      <p>Tratamos los datos que nos facilitas voluntariamente al:</p>
      <ul>
        <li>
          <strong>Rellenar el formulario de contacto:</strong> nombre, email, teléfono
          (opcional), empresa (opcional) y mensaje.
        </li>
        <li>
          <strong>Suscribirte a comunicaciones:</strong> nombre y email.
        </li>
        <li>
          <strong>Solicitar acceso al área cliente:</strong> nombre, email, datos de la
          empresa y, en su caso, datos de facturación.
        </li>
      </ul>
      <p>
        Adicionalmente recopilamos, de forma automática y limitada, datos técnicos como
        la dirección IP, el user-agent del navegador y la marca temporal del envío para
        proteger el formulario frente a abusos (rate-limiting, prevención de spam).
      </p>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Tratamos tus datos para los siguientes fines:</p>
      <ul>
        <li>Atender tus consultas y elaborar la propuesta solicitada.</li>
        <li>Gestionar la relación comercial si decides contratar nuestros servicios.</li>
        <li>
          Cumplir con obligaciones legales, contables y fiscales aplicables a nuestra
          actividad.
        </li>
        <li>
          Proteger nuestros sistemas y prevenir fraude o uso indebido de los formularios.
        </li>
      </ul>

      <h2>4. Base jurídica</h2>
      <p>El tratamiento se ampara en las siguientes bases legales:</p>
      <ul>
        <li>
          <strong>Consentimiento</strong> (art. 6.1.a RGPD) que prestas al enviar el
          formulario tras aceptar esta política.
        </li>
        <li>
          <strong>Ejecución de contrato o medidas precontractuales</strong> (art. 6.1.b
          RGPD) cuando la consulta se enmarca en una negociación de servicios.
        </li>
        <li>
          <strong>Cumplimiento de obligación legal</strong> (art. 6.1.c RGPD) en lo
          relativo a contabilidad, facturación y archivo.
        </li>
        <li>
          <strong>Interés legítimo</strong> (art. 6.1.f RGPD) en proteger nuestros
          sistemas frente a abusos.
        </li>
      </ul>

      <h2>5. Conservación de los datos</h2>
      <ul>
        <li>
          <strong>Leads no convertidos:</strong> hasta 24 meses desde el último contacto,
          salvo que solicites antes su supresión.
        </li>
        <li>
          <strong>Clientes:</strong> durante toda la relación contractual y, tras su
          finalización, durante los plazos legales aplicables (mercantil, fiscal,
          laboral).
        </li>
        <li>
          <strong>Datos técnicos de seguridad:</strong> 12 meses, salvo que sea
          necesario un periodo mayor por incidencia documentada.
        </li>
      </ul>

      <h2>6. Destinatarios y encargados de tratamiento</h2>
      <p>
        Tus datos no se ceden a terceros salvo obligación legal. Para la prestación del
        servicio podemos recurrir a encargados de tratamiento que prestan servicios
        técnicos imprescindibles, todos ellos comprometidos por contrato a cumplir el
        RGPD:
      </p>
      <ul>
        <li>
          <strong>Hetzner Online GmbH</strong> (Alemania, UE) — alojamiento de servidores
          y base de datos.
        </li>
        <li>
          <strong>Resend, Inc.</strong> (proveedor de envío transaccional de correo) — el
          tratamiento se realiza con cláusulas contractuales tipo (CCT) cuando aplique
          transferencia internacional.
        </li>
        <li>
          <strong>Plausible Analytics</strong> autohospedado en infraestructura propia en
          la UE — analítica web sin cookies ni datos personales.
        </li>
      </ul>
      <p>
        Mantenemos un registro de actividades de tratamiento conforme al artículo 30 del
        RGPD a disposición de la autoridad de control.
      </p>

      <h2>7. Transferencias internacionales</h2>
      <p>
        Salvo lo indicado para Resend (que pueda implicar tratamiento fuera del EEE bajo
        cláusulas contractuales tipo aprobadas por la Comisión Europea), no realizamos
        transferencias internacionales de tus datos.
      </p>

      <h2>8. Tus derechos</h2>
      <p>Como interesado puedes ejercer en cualquier momento los siguientes derechos:</p>
      <ul>
        <li>
          <strong>Acceso:</strong> obtener confirmación sobre si tratamos tus datos y, en
          su caso, una copia.
        </li>
        <li>
          <strong>Rectificación:</strong> corregir datos inexactos o incompletos.
        </li>
        <li>
          <strong>Supresión:</strong> solicitar el borrado cuando los datos ya no sean
          necesarios para la finalidad.
        </li>
        <li>
          <strong>Limitación:</strong> restringir el tratamiento mientras se verifica la
          exactitud o la licitud.
        </li>
        <li>
          <strong>Oposición:</strong> oponerte a un tratamiento basado en interés
          legítimo.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir tus datos en formato estructurado y de
          uso común.
        </li>
        <li>
          <strong>Retirar el consentimiento</strong> en cualquier momento, sin que ello
          afecte a la licitud de los tratamientos previos.
        </li>
      </ul>
      <p>
        Para ejercer estos derechos, escribe a{' '}
        <a href="mailto:privacidad@wyweb.es">privacidad@wyweb.es</a> indicando el derecho
        que ejercitas y adjuntando copia de un documento identificativo.
      </p>
      <p>
        Si consideras que el tratamiento no se ajusta a la normativa, tienes derecho a
        presentar una reclamación ante la Agencia Española de Protección de Datos
        (AEPD):{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        .
      </p>

      <h2>9. Medidas de seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas al riesgo del tratamiento:
        cifrado en tránsito mediante TLS, cifrado de datos sensibles en reposo,
        autenticación robusta para personal autorizado, registro de auditoría de
        operaciones críticas, copias de seguridad verificadas y formación periódica al
        equipo en materia de protección de datos.
      </p>

      <h2>10. Decisiones automatizadas</h2>
      <p>
        No tomamos decisiones automatizadas, incluida la elaboración de perfiles, que
        produzcan efectos jurídicos significativos sobre el interesado.
      </p>

      <h2>11. Modificaciones</h2>
      <p>
        Podemos actualizar esta política para adaptarla a cambios normativos o a nuevos
        servicios. Publicaremos la versión vigente en este mismo enlace e indicaremos la
        fecha de la última actualización.
      </p>
    </LegalLayout>
  );
}
