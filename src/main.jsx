import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: 'Marca y emprendimiento',
    copy: 'Retratos, contenido para redes, piezas de lanzamiento y una dirección visual clara.',
    image: 'https://picsum.photos/seed/lumar-brand-color-portrait/900/1200'
  },
  {
    title: 'Producto y ecommerce',
    copy: 'Fotos limpias, vídeo corto y material listo para vender sin parecer catálogo genérico.',
    image: 'https://picsum.photos/seed/lumar-product-tenerife/900/1200'
  },
  {
    title: 'Eventos y momentos',
    copy: 'Cobertura social con mirada editorial, color vivo y entregas pensadas para compartir.',
    image: 'https://picsum.photos/seed/lumar-event-light/900/1200'
  },
  {
    title: 'Moda y retrato',
    copy: 'Sesiones con concepto, poses dirigidas y estética con energía de campaña.',
    image: 'https://picsum.photos/seed/lumar-fashion-atlantic/900/1200'
  }
];

const packages = [
  ['Exploración', 'Reunión breve para entender objetivo, referencias, fecha y uso final.'],
  ['Propuesta', 'Recibes enfoque visual, necesidades, rango de precio y siguiente paso.'],
  ['Producción', 'Sesión de foto, vídeo o contenido con dirección clara y entrega organizada.'],
  ['Reserva', 'Cuando el alcance encaja, se confirma fecha, anticipo y plan de sesión.']
];

function BrandMark({ dark = false }) {
  return (
    <svg className="brand-mark" viewBox="0 0 120 120" aria-label="LUMAR Visuals">
      <g className="mark-rays" stroke={dark ? '#131313' : '#fffdf5'} strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * Math.PI) / 8;
          const x1 = 60 + Math.cos(a) * 44;
          const y1 = 60 + Math.sin(a) * 44;
          const x2 = 60 + Math.cos(a) * (i % 2 ? 50 : 58);
          const y2 = 60 + Math.sin(a) * (i % 2 ? 50 : 58);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <circle cx="60" cy="60" r="42" fill="#f7d842" stroke={dark ? '#131313' : '#fffdf5'} strokeWidth="4" />
      <path d="M60 60 L60 28 A32 32 0 0 1 88 48 Z" fill="#ff4f2e" />
      <path d="M60 60 L88 48 A32 32 0 0 1 83 78 Z" fill="#e94196" />
      <path d="M60 60 L83 78 A32 32 0 0 1 51 91 Z" fill="#6a35ff" />
      <path d="M60 60 L51 91 A32 32 0 0 1 28 66 Z" fill="#1557ff" />
      <path d="M60 60 L28 66 A32 32 0 0 1 40 34 Z" fill="#00c7c7" />
      <path d="M60 60 L40 34 A32 32 0 0 1 60 28 Z" fill="#ff4f2e" />
      <circle cx="60" cy="60" r="15" fill={dark ? '#fff4dc' : '#131313'} stroke={dark ? '#131313' : '#fffdf5'} strokeWidth="4" />
      <path d="M29 78 C43 66 52 92 66 78 C76 68 84 72 93 78" fill="none" stroke={dark ? '#131313' : '#fffdf5'} strokeWidth="5" strokeLinecap="round" />
      <path d="M94 20 101 41 122 45 104 57 110 79 94 64 76 79 82 57 64 45 86 41Z" fill="#fff4dc" stroke={dark ? '#131313' : '#131313'} strokeWidth="3" />
    </svg>
  );
}

function useScrollMotion() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-word', { y: '105%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1.25, stagger: 0.1, ease: 'power4.out' });
      gsap.fromTo('.float-card', { y: 60, rotate: -2, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.45 });

      gsap.utils.toArray('.scale-in').forEach((el) => {
        gsap.fromTo(el, { scale: 0.82, opacity: 0.45 }, {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true }
        });
      });

      gsap.utils.toArray('.reveal-line').forEach((el) => {
        gsap.fromTo(el, { opacity: 0.14, y: 28 }, {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: true }
        });
      });

      const pinned = document.querySelector('.pin-story');
      if (pinned && window.matchMedia('(min-width: 900px)').matches) {
        ScrollTrigger.create({
          trigger: pinned,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.pin-copy',
          pinSpacing: false
        });
      }
    });
    return () => ctx.revert();
  }, []);
}

function InquiryForm() {
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [busy, setBusy] = useState(false);
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: 'idle', message: '' });

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = form.consent.checked;

    try {
      const response = await fetch(`${apiBase}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la solicitud');
      setStatus({
        type: 'success',
        message: result.emailSent
          ? 'Solicitud enviada. Te responderemos para concretar la consulta y la propuesta.'
          : 'Solicitud guardada. Falta configurar SMTP para que también llegue por email.'
      });
      form.reset();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Revisa los datos e inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Nombre completo
          <input name="name" required placeholder="Tu nombre" />
        </label>
        <label>
          Email
          <input name="email" type="email" required placeholder="tu@email.com" />
        </label>
        <label>
          WhatsApp o teléfono
          <input name="phone" placeholder="+34 600 000 000" />
        </label>
        <label>
          Instagram o web
          <input name="instagram" placeholder="@tuusuario o web" />
        </label>
        <label>
          Servicio que necesitas
          <select name="service" required defaultValue="">
            <option value="" disabled>Selecciona una opción</option>
            <option>Marca y emprendimiento</option>
            <option>Producto o ecommerce</option>
            <option>Evento social</option>
            <option>Moda o retrato</option>
            <option>Video corto o contenido mensual</option>
            <option>No estoy seguro, quiero asesoría</option>
          </select>
        </label>
        <label>
          Ubicación
          <input name="location" placeholder="Puerto Santiago, Adeje, Tenerife..." />
        </label>
        <label>
          Fecha orientativa
          <input name="preferredDate" placeholder="Mes, semana o fecha ideal" />
        </label>
        <label>
          Presupuesto estimado
          <select name="budget" defaultValue="">
            <option value="">Prefiero recibir orientación</option>
            <option>Menos de 250 €</option>
            <option>250 € a 500 €</option>
            <option>500 € a 900 €</option>
            <option>900 € a 1.500 €</option>
            <option>Más de 1.500 €</option>
          </select>
        </label>
        <label className="wide">
          ¿Qué quieres conseguir con la sesión?
          <textarea name="projectBrief" required rows="6" placeholder="Cuéntanos qué necesitas, para cuándo, dónde se usará el contenido y si tienes referencias visuales." />
        </label>
        <label>
          Preferencia de reunión
          <select name="meetingPreference" required defaultValue="">
            <option value="" disabled>Elige una opción</option>
            <option>Videollamada</option>
            <option>WhatsApp primero</option>
            <option>Llamada telefónica</option>
            <option>Reunión presencial si encaja</option>
          </select>
        </label>
      </div>
      <label className="consent">
        <input name="consent" type="checkbox" required />
        Acepto que LUMAR Visuals use estos datos para responder a mi consulta y preparar una propuesta.
      </label>
      <button className="submit-button" type="submit" disabled={busy}>{busy ? 'Enviando solicitud' : 'Solicitar consulta y precio'}</button>
      {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
    </form>
  );
}

function App() {
  useScrollMotion();
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="page-shell overflow-guard">
      <nav className="nav-wrap">
        <a className="nav-brand" href="#top" aria-label="LUMAR Visuals inicio">
          <BrandMark />
          <span>LUMAR Visuals</span>
        </a>
        <div className="nav-links">
          <a href="#servicios">Servicios</a>
          <a href="#proceso">Proceso</a>
          <a href="#consulta">Consulta</a>
        </div>
        <a className="nav-cta" href="#consulta">Pedir precio</a>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="kicker">Foto, video y contenido visual en Tenerife</p>
          <h1>
            <span className="hero-word-wrap"><span className="hero-word">Luz, color</span></span>
            <span className="hero-word-wrap"><span className="hero-word">y cero poses aburridas.</span></span>
          </h1>
          <p className="hero-copy">Creamos contenido para marcas, productos, eventos y personas que necesitan verse bien antes de pedir precio.</p>
          <div className="hero-actions">
            <a className="primary-action" href="#consulta">Solicitar consulta</a>
            <a className="secondary-action" href="#servicios">Ver servicios</a>
          </div>
        </div>
        <div className="hero-collage" aria-hidden="true">
          <div className="float-card card-one scale-in" />
          <div className="float-card card-two scale-in" />
          <div className="float-card card-three">
            <BrandMark dark />
            <span>Contenido con ritmo propio.</span>
          </div>
        </div>
      </section>

      <section id="servicios" className="services-section">
        <div className="section-heading">
          <h2>De una idea suelta a una sesión con dirección.</h2>
          <p>No necesitas llegar con todo cerrado. El formulario recoge lo importante para preparar una conversación útil: objetivo, fecha, servicio, uso del contenido y presupuesto orientativo.</p>
        </div>
        <div className="bento-grid">
          {services.map((service, index) => (
            <article className={`service-card service-${index + 1}`} key={service.title}>
              <div className="service-image" style={{ backgroundImage: `url(${service.image})` }} />
              <div className="service-body">
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </div>
            </article>
          ))}
          <article className="service-card studio-note">
            <BrandMark />
            <h3>Sin prometer estudio fijo.</h3>
            <p>Trabajamos en localización, espacios del cliente y pequeños montajes tipo mini estudio cuando el proyecto lo pide.</p>
          </article>
        </div>
      </section>

      <section className="pin-story" id="proceso">
        <div className="pin-copy">
          <h2 className="reveal-line">Primero entendemos. Luego cotizamos.</h2>
          <p className="reveal-line">La reunión no es para venderte un paquete cerrado. Es para descubrir qué contenido necesitas, cómo se va a usar y qué producción tiene sentido.</p>
        </div>
        <div className="process-stack">
          {packages.map(([title, copy], index) => (
            <article className="process-card scale-in" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="desire-section">
        <div className="desire-copy">
          <h2 className="reveal-line">El cliente no compra una sesión. Compra claridad antes de reservar.</h2>
          <p className="reveal-line">Por eso el formulario pide los datos que hacen falta para responder con una propuesta realista, no una cifra lanzada al aire.</p>
        </div>
        <div className="proof-strip">
          <span>brief claro</span>
          <span>precio orientado</span>
          <span>fecha viable</span>
          <span>reserva segura</span>
        </div>
      </section>

      <section id="consulta" className="contact-section">
        <div className="contact-intro">
          <BrandMark />
          <h2>Cuéntanos qué necesitas y te preparamos el siguiente paso.</h2>
          <p>Recibiremos tu solicitud con los datos relevantes para darte una orientación de precio y, si encaja, agendar la sesión.</p>
        </div>
        <InquiryForm />
      </section>

      <footer className="footer-section">
        <div>
          <BrandMark />
          <p>LUMAR Visuals</p>
        </div>
        <span>Foto, video y contenido visual en Tenerife.</span>
        <span>{year}</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
