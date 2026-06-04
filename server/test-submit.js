const payload = {
  name: 'Cliente Demo',
  email: 'cliente.demo@example.com',
  phone: '+34 600 000 000',
  instagram: '@cliente_demo',
  service: 'Producto o ecommerce',
  location: 'Puerto Santiago, Tenerife',
  preferredDate: 'Próximo mes',
  budget: '250 € a 500 €',
  meetingPreference: 'Videollamada',
  projectBrief: 'Necesito fotos de producto y algunos vídeos cortos para una campaña de lanzamiento.',
  consent: true
};

const response = await fetch('http://localhost:8787/api/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const result = await response.json();
console.log(JSON.stringify({ status: response.status, result }, null, 2));
if (!response.ok) process.exit(1);
