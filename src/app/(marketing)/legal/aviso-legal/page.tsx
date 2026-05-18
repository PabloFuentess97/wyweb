import type { Metadata } from 'next';
import { LegalLayout, legalNav } from '@/components/marketing/legal-layout';

export const metadata: Metadata = {
  title: 'Aviso legal',
  description:
    'Información legal y de identificación de Wyweb conforme a la LSSI-CE.',
  alternates: { canonical: '/legal/aviso-legal' },
  robots: { index: true, follow: true },
};

export default function AvisoLegalPage() {
  const related = legalNav.map((n) => ({
    ...n,
    current: n.href === '/legal/aviso-legal',
  }));
  return (
    <LegalLayout
      number="01"
      eyebrow="LSSI-CE · LEY 34/2002"
      title="Aviso legal"
      lastUpdated="1 de mayo de 2026"
      intro="Información legal del titular del sitio wyweb.es en cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE)."
      related={related}
    >
      <h2>1. Datos identificativos del titular</h2>
      <p>
        En cumplimiento del deber de información recogido en la LSSI-CE, ponemos
        en conocimiento de los usuarios los siguientes datos:
      </p>
      <dl>
        <dt>Nombre comercial</dt>
        <dd>Wyweb</dd>
        <dt>Razón social</dt>
        <dd>[Pendiente de configurar en /admin/ajustes]</dd>
        <dt>CIF / NIF</dt>
        <dd>[Pendiente de configurar]</dd>
        <dt>Domicilio</dt>
        <dd>
          <address>España · 100% remoto</address>
        </dd>
        <dt>Email de contacto</dt>
        <dd>
          <a href="mailto:hola@wyweb.es">hola@wyweb.es</a>
        </dd>
        <dt>Sitio web</dt>
        <dd>
          <a href="https://wyweb.es">https://wyweb.es</a>
        </dd>
      </dl>

      <h2>2. Objeto del sitio web</h2>
      <p>
        El sitio <strong>wyweb.es</strong> es la web institucional de Wyweb (en
        adelante, &ldquo;Wyweb&rdquo;). Su finalidad es informar sobre la
        actividad y los servicios profesionales —diseño y desarrollo web, SaaS a
        medida, ecommerce, SEO, mantenimiento y branding— así como facilitar la
        comunicación con clientes, potenciales clientes y terceros interesados.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y uso del sitio atribuye la condición de usuario e implica la
        aceptación de las presentes condiciones. El usuario se compromete a
        hacer un uso diligente, lícito y conforme a la buena fe del contenido y
        de los servicios ofrecidos.
      </p>
      <p>Queda expresamente prohibido:</p>
      <ul>
        <li>
          Utilizar el sitio para fines ilícitos, lesivos de derechos o intereses
          de Wyweb o de terceros.
        </li>
        <li>
          Realizar actividades publicitarias o de explotación comercial no
          autorizadas.
        </li>
        <li>
          Introducir o difundir contenidos o programas (virus, código malicioso,
          etc.) que puedan causar daños en los sistemas informáticos de Wyweb o
          de terceros.
        </li>
        <li>
          Intentar acceder a áreas restringidas, descifrar credenciales o
          realizar ingeniería inversa sobre los servicios.
        </li>
      </ul>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del sitio (textos, fotografías, gráficos, imágenes,
        iconos, tecnología, software, así como su diseño gráfico y códigos
        fuente) son titularidad exclusiva de Wyweb o de terceros que han
        autorizado su uso, y están protegidos por la normativa de propiedad
        intelectual e industrial.
      </p>
      <p>
        Queda prohibida cualquier reproducción, distribución, comunicación
        pública, transformación o cualquier otra actividad que pueda realizarse
        con los contenidos del sitio sin la previa autorización expresa de
        Wyweb, salvo que la legislación vigente autorice alguno de estos usos
        sin necesidad de consentimiento.
      </p>
      <p>
        La marca <strong>Wyweb</strong> y los signos distintivos asociados son
        titularidad de la empresa y se encuentran protegidos por la legislación
        aplicable.
      </p>

      <h2>5. Enlaces a sitios de terceros</h2>
      <p>
        El sitio puede contener enlaces a recursos externos. Wyweb no se
        responsabiliza del contenido, la disponibilidad ni el tratamiento de
        datos que realicen estos sitios. Recomendamos al usuario revisar las
        condiciones legales y políticas de privacidad de cada uno antes de
        utilizarlos.
      </p>

      <h2>6. Exclusión de garantías y responsabilidad</h2>
      <p>
        Wyweb trabaja para mantener el sitio operativo y libre de errores, pero
        no garantiza la disponibilidad ininterrumpida ni la ausencia total de
        fallos técnicos. Wyweb no será responsable de los daños o perjuicios
        derivados de interrupciones, virus o desconexiones que escapen a su
        diligencia razonable.
      </p>
      <p>
        Las áreas privadas (área cliente, backoffice) cuentan con sus propios
        términos de servicio aplicables de manera específica a los usuarios
        autorizados.
      </p>

      <h2>7. Modificaciones</h2>
      <p>
        Wyweb se reserva el derecho a modificar este aviso legal en cualquier
        momento. Las modificaciones serán efectivas desde su publicación en este
        sitio. Recomendamos consultar este documento periódicamente.
      </p>

      <h2>8. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier
        controversia derivada del uso del sitio, las partes se someten, con
        renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales
        que correspondan según la legislación española, salvo en los supuestos
        en los que la normativa imperativa establezca un fuero distinto en
        protección del consumidor.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Cualquier consulta sobre este aviso legal puede dirigirse a:{' '}
        <a href="mailto:hola@wyweb.es">hola@wyweb.es</a>.
      </p>
    </LegalLayout>
  );
}
