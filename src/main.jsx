import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const services = [
  {
    title: 'Marca y emprendimiento',
    copy: 'Retratos, contenido para redes y una dirección visual clara para tu negocio.',
    image: '/img/hero.png'
  },
  {
    title: 'Producto y ecommerce',
    copy: 'Fotos limpias, vídeo corto y material listo para vender.',
    image: '/img/product.png'
  },
  {
    title: 'Eventos y momentos',
    copy: 'Cobertura con mirada editorial, color vivo y entregas rápidas.',
    image: '/img/events.png'
  }
];

const process = [
  { step: '01', title: 'Exploración', copy: 'Reunión breve para entender objetivo, referencias, fecha y uso final del contenido.' },
  { step: '02', title: 'Propuesta', copy: 'Recibes enfoque visual, necesidades técnicas, rango de precio y siguiente paso concreto.' },
  { step: '03', title: 'Producción', copy: 'Sesión de foto, vídeo o contenido con dirección clara y entrega organizada.' },
  { step: '04', title: 'Reserva', copy: 'Cuando el alcance encaja, se confirma fecha, anticipo y plan de sesión.' }
];

/* ------------------------------------------------------------------ */
/*  BrandMark SVG                                                      */
/* ------------------------------------------------------------------ */

function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label="LUMAR Visuals">
      <circle cx="60" cy="60" r="42" fill="#2dd4bf" />
      <circle cx="60" cy="60" r="15" fill="#0a0a0b" />
      <path d="M29 78 C43 66 52 92 66 78 C76 68 84 72 93 78" fill="none" stroke="#0a0a0b" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll Animations                                                  */
/* ------------------------------------------------------------------ */

function useScrollMotion() {
  useEffect(() => {
    const mm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mm.matches) return;

    const ctx = gsap.context(() => {
      /* Hero text reveal */
      gsap.fromTo('.hero-reveal',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: .1, ease: 'power3.out', delay: .15 }
      );

      /* Hero image slide-in */
      gsap.fromTo('.hero-visual',
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: .3 }
      );

      /* Scroll reveals */
      gsap.utils.toArray('.scroll-reveal').forEach((el) => {
        gsap.fromTo(el,
          { y: 32, opacity: 0 },
          {
            y: 0, opacity: 1, duration: .8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        );
      });

      /* Service tile stagger */
      gsap.utils.toArray('.service-tile').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: .9, ease: 'power3.out', delay: i * .08,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          }
        );
      });

      /* Process cards stagger */
      gsap.utils.toArray('.process-card').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: .8, ease: 'power3.out', delay: i * .06,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true }
          }
        );
      });

      /* Value prop image parallax */
      const vImg = document.querySelector('.value-visual img');
      if (vImg) {
        gsap.fromTo(vImg,
          { y: -30 },
          {
            y: 30, ease: 'none',
            scrollTrigger: { trigger: '.value-visual', start: 'top bottom', end: 'bottom top', scrub: true }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Inquiry Form                                                       */
/* ------------------------------------------------------------------ */

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
          <input name="location" placeholder="Puerto Santiago, Adeje..." />
        </label>
        <label>
          Fecha orientativa
          <input name="preferredDate" placeholder="Mes, semana o fecha ideal" />
        </label>
        <label>
          Presupuesto estimado
          <select name="budget" defaultValue="">
            <option value="">Prefiero recibir orientación</option>
            <option>Menos de 250 EUR</option>
            <option>250 a 500 EUR</option>
            <option>500 a 900 EUR</option>
            <option>900 a 1.500 EUR</option>
            <option>Más de 1.500 EUR</option>
          </select>
        </label>
        <label className="wide">
          Qué quieres conseguir con la sesión
          <textarea name="projectBrief" required rows="5" placeholder="Cuéntanos qué necesitas, para cuándo, dónde se usará el contenido y si tienes referencias visuales." />
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
      <div className="consent-row">
        <input name="consent" type="checkbox" required />
        <span>Acepto que LUMAR Visuals use estos datos para responder a mi consulta y preparar una propuesta.</span>
      </div>
      <button className="submit-btn" type="submit" disabled={busy}>
        {busy ? 'Enviando...' : 'Solicitar consulta'}
      </button>
      {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

function App() {
  useScrollMotion();
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <>
      {/* Navigation */}
      <nav className="nav" role="navigation" aria-label="Principal">
        <a className="nav-logo" href="#top">
          <BrandMark />
          <span>LUMAR</span>
        </a>
        <div className="nav-links">
          <a href="#servicios">Servicios</a>
          <a href="#proceso">Proceso</a>
          <a href="#consulta">Consulta</a>
        </div>
        <a className="nav-cta" href="#consulta">Pedir precio</a>
      </nav>

      <main>
        {/* Hero */}
        <section id="top" className="container hero">
          <div className="hero-text">
            <span className="hero-eyebrow hero-reveal">Foto y vídeo en Tenerife</span>
            <h1 className="hero-reveal">Contenido visual que vende antes de explicar</h1>
            <p className="hero-sub hero-reveal">Creamos foto, vídeo y dirección visual para marcas, productos y personas que necesitan verse bien.</p>
            <div className="hero-ctas hero-reveal">
              <a className="btn-primary" href="#consulta">Solicitar consulta</a>
              <a className="btn-ghost" href="#servicios">Ver servicios</a>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/img/hero.png" alt="Sesión editorial de moda en playa volcánica de Tenerife" loading="eager" />
          </div>
        </section>

        {/* Services */}
        <section id="servicios" className="container services">
          <div className="services-header scroll-reveal">
            <h2 className="section-title">Cada proyecto necesita un enfoque distinto</h2>
            <p className="section-body">No vendemos paquetes cerrados. Escuchamos, proponemos y producimos contenido que encaja con tu objetivo real.</p>
          </div>
          <div className="services-grid">
            {services.map((s) => (
              <article className="service-tile" key={s.title}>
                <img src={s.image} alt={s.title} loading="lazy" />
                <div className="overlay">
                  <h3>{s.title}</h3>
                  <p>{s.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Process */}
        <section id="proceso" className="container process">
          <div className="process-header scroll-reveal">
            <h2 className="section-title">Primero entendemos, luego cotizamos</h2>
            <p className="section-body">La reunión no es para venderte algo cerrado. Es para descubrir qué contenido necesitas y qué producción tiene sentido.</p>
          </div>
          <div className="process-track">
            {process.map((p) => (
              <article className="process-card" key={p.step}>
                <span className="step-num">{p.step}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Value Prop */}
        <section className="container value-prop">
          <div className="value-prop-text scroll-reveal">
            <h2 className="section-title">Claridad antes de reservar</h2>
            <p className="section-body">El formulario recoge los datos que hacen falta para responder con una propuesta realista, no una cifra al aire.</p>
            <div className="value-badges">
              <span>Brief claro</span>
              <span>Precio orientado</span>
              <span>Fecha viable</span>
              <span>Reserva segura</span>
            </div>
          </div>
          <div className="value-visual scroll-reveal">
            <img src="/img/portrait.png" alt="Retrato editorial con iluminación cinematográfica" loading="lazy" />
          </div>
        </section>

        {/* Contact */}
        <section id="consulta" className="container contact">
          <div className="contact-layout">
            <div className="contact-intro-block scroll-reveal">
              <h2 className="section-title">Cuéntanos qué necesitas</h2>
              <p className="section-body">Recibiremos tu solicitud con los datos relevantes para darte una orientación de precio y, si encaja, agendar la sesión.</p>
              <div className="contact-cta-info">
                <span>Tenerife, Islas Canarias</span>
                <span>Respuesta en menos de 48h</span>
              </div>
            </div>
            <div className="scroll-reveal">
              <InquiryForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container footer">
        <div className="footer-brand">
          <BrandMark size={24} />
          <span>LUMAR Visuals</span>
        </div>
        <span>Foto, vídeo y contenido visual en Tenerife. {year}</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
