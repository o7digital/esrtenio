import { useState } from 'react';

const profiles = {
  empresa: {
    button: 'Soy empresa',
    title: 'La tranquilidad de una operación en orden.',
    copy: 'Acompañamos a tu empresa en el cumplimiento de sus obligaciones y en la atención de contingencias ante IMSS e INFONAVIT.',
    items: ['Auditoría preventiva', 'Cumplimiento patronal', 'Corrección y defensa'],
  },
  persona: {
    button: 'Soy particular',
    title: 'Tu historia laboral merece una mirada completa.',
    copy: 'Analizamos tus antecedentes y alternativas para ayudarte a tomar decisiones informadas sobre tu retiro.',
    items: ['Estudio de pensión', 'Revisión de historial', 'Recuperación de fondos'],
  },
  obra: {
    button: 'Sector construcción',
    title: 'Construir con una base de cumplimiento.',
    copy: 'Acompañamos a constructoras y desarrolladoras en las obligaciones de Seguridad Social relacionadas con sus obras.',
    items: ['SIROC y registro de obras', 'Control documental', 'Obligaciones ante IMSS'],
  },
} as const;

type ProfileKey = keyof typeof profiles;
const profileKeys = Object.keys(profiles) as ProfileKey[];

export default function AudienceSelector() {
  const [activeKey, setActiveKey] = useState<ProfileKey>('empresa');
  const active = profiles[activeKey];

  return (
    <section className="audience" id="enfoque">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="label audience-label">03 / TU PUNTO DE PARTIDA</div>
            <h2>Tu realidad define<br /><em>nuestra estrategia.</em></h2>
          </div>
          <p>Selecciona tu perfil y descubre dónde podemos ayudarte.</p>
        </div>
        <div className="audience-switch" aria-label="Seleccionar perfil">
          {profileKeys.map((key) => (
            <button
              type="button"
              className={activeKey === key ? 'active' : ''}
              aria-pressed={activeKey === key}
              onClick={() => setActiveKey(key)}
              key={key}
            >
              {profiles[key].button}
            </button>
          ))}
        </div>
        <div className="audience-content" aria-live="polite" key={activeKey}>
          <div>
            <h3>{active.title}</h3>
            <p>{active.copy}</p>
          </div>
          <ul>
            {active.items.map((item, index) => (
              <li key={item}>{item} <span>0{index + 1}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
