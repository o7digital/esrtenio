import { useRef, useState, type KeyboardEvent } from 'react';

const services = {
  audit: {
    number: '01',
    tab: 'Auditoría',
    label: 'PREVENIR. CORREGIR. PROTEGER.',
    title: 'Anticiparse es la mejor forma de proteger.',
    text: 'Identificamos riesgos e inconsistencias en tus obligaciones de Seguridad Social para ayudarte a actuar con información y certeza.',
    tags: ['Dictamen IMSS', 'Dictamen INFONAVIT', 'Auditoría preventiva'],
    contact: 'auditoría',
  },
  legal: {
    number: '02',
    tab: 'Defensa legal',
    label: 'CRITERIO. ESTRATEGIA. DEFENSA.',
    title: 'Una defensa a la altura de lo que importa.',
    text: 'Representación estratégica ante actos del IMSS e INFONAVIT: multas, créditos, negativas de devolución y controversias.',
    tags: ['Litigio', 'Recursos y amparos', 'Convenios'],
    contact: 'defensa legal',
  },
  infonavit: {
    number: '03',
    tab: 'INFONAVIT',
    label: 'ACOMPAÑAMIENTO ESPECIALIZADO.',
    title: 'Más claridad en cada obligación.',
    text: 'Asesoría para empresas y trabajadores en la gestión de créditos, cumplimiento, recuperación y celebración de convenios.',
    tags: ['Créditos', 'Cumplimiento', 'Convenios'],
    contact: 'INFONAVIT',
  },
  pension: {
    number: '04',
    tab: 'Pensiones',
    label: 'TU TRAYECTORIA. TU FUTURO.',
    title: 'Un retiro que empieza con buenas decisiones.',
    text: 'Estudiamos tu historial y tus alternativas para ayudarte a planear tu pensión y la recuperación de fondos.',
    tags: ['Estudio de pensión', 'AFORE', 'Planeación del retiro'],
    contact: 'pensiones',
  },
} as const;

type ServiceKey = keyof typeof services;
const serviceKeys = Object.keys(services) as ServiceKey[];

export default function Expertise() {
  const [activeKey, setActiveKey] = useState<ServiceKey>('audit');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = services[activeKey];

  const selectTab = (key: ServiceKey, index?: number) => {
    setActiveKey(key);
    if (index !== undefined) tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const { key } = event;
    if (!['ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(key)) return;

    event.preventDefault();
    let nextIndex = index;
    if (key === 'Home') nextIndex = 0;
    else if (key === 'End') nextIndex = serviceKeys.length - 1;
    else if (key === 'ArrowRight' || key === 'ArrowDown') {
      nextIndex = (index + 1) % serviceKeys.length;
    } else {
      nextIndex = (index - 1 + serviceKeys.length) % serviceKeys.length;
    }
    selectTab(serviceKeys[nextIndex], nextIndex);
  };

  return (
    <section className="expertise" id="especialidades">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-kicker"><b>02 /</b> ESPECIALIDADES</div>
            <h2>El respaldo adecuado.<br />En el momento decisivo.</h2>
          </div>
          <p>Cuatro áreas de conocimiento. Una estrategia construida alrededor de tu situación.</p>
        </div>
        <div className="service-grid">
          <div className="service-tabs" role="tablist" aria-label="Especialidades">
            {serviceKeys.map((key, index) => {
              const service = services[key];
              const selected = activeKey === key;
              return (
                <button
                  className={`service-tab${selected ? ' active' : ''}`}
                  role="tab"
                  id={`tab-${key}`}
                  aria-selected={selected}
                  aria-controls="service-panel"
                  tabIndex={selected ? 0 : -1}
                  ref={(node) => { tabRefs.current[index] = node; }}
                  onClick={() => selectTab(key)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  key={key}
                >
                  <span className="num">{service.number}</span>
                  <span className="title">{service.tab}</span>
                  <span className="plus">↗</span>
                </button>
              );
            })}
          </div>
          <div
            className="service-panel reveal"
            id="service-panel"
            role="tabpanel"
            aria-labelledby={`tab-${activeKey}`}
            key={activeKey}
          >
            <span className="watermark" aria-hidden="true">{active.number}</span>
            <div className="label">{active.label}</div>
            <h3>{active.title}</h3>
            <p>{active.text}</p>
            <div className="tags">
              {active.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <a href="#contacto">Consultar sobre {active.contact} ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}
