// SOA (Service-Oriented Architecture): servicios EMPRESARIALES reutilizables que se comunican
// a través de un ESB (Enterprise Service Bus). El ESB hace enrutamiento, transformación de
// mensajes (ej. XML ↔ JSON), orquestación y aplica políticas (seguridad, logging).
//
// Ejecutar: node soa.js

// ---- Servicios empresariales (cada uno con su propio "contrato" y formato) ----
const ServicioClientesLegacy = {
  // Sistema viejo que habla "XML"
  contrato: 'ClienteService v1 (XML)',
  invocar(xml) {
    const id = xml.match(/<id>(\d+)<\/id>/)[1];
    return `<cliente><id>${id}</id><nombre>ACME S.A.</nombre><credito>5000</credito></cliente>`;
  },
};

const ServicioFacturacion = {
  contrato: 'FacturacionService v2 (JSON)',
  invocar({ cliente, monto }) {
    return { factura: `F-${Date.now() % 10000}`, cliente, monto, iva: monto * 0.21 };
  },
};

// ---- ESB: el "bus inteligente" ----
class ESB {
  constructor() {
    this.registro = new Map(); // registro/repositorio de servicios (UDDI)
  }
  registrar(nombre, servicio, { entrada = (x) => x, salida = (x) => x } = {}) {
    this.registro.set(nombre, { servicio, entrada, salida });
  }
  invocar(nombre, mensaje) {
    const s = this.registro.get(nombre);
    if (!s) throw new Error(`Servicio ${nombre} no registrado`);
    console.log(`[ESB] → ${nombre} (${s.servicio.contrato})`); // política: auditoría
    return s.salida(s.servicio.invocar(s.entrada(mensaje))); // transformación
  }
  // Orquestación: un proceso de negocio compuesto por varios servicios
  procesoVenta(clienteId, monto) {
    const cliente = this.invocar('clientes', { id: clienteId });
    if (cliente.credito < monto) throw new Error('Crédito insuficiente');
    return this.invocar('facturacion', { cliente: cliente.nombre, monto });
  }
}

const esb = new ESB();
esb.registrar('clientes', ServicioClientesLegacy, {
  entrada: (json) => `<req><id>${json.id}</id></req>`, // JSON → XML
  salida: (xml) => ({
    nombre: xml.match(/<nombre>(.*?)<\/nombre>/)[1],
    credito: Number(xml.match(/<credito>(.*?)<\/credito>/)[1]),
  }), // XML → JSON
});
esb.registrar('facturacion', ServicioFacturacion);

console.log(esb.procesoVenta(7, 1200));
try {
  esb.procesoVenta(7, 99999);
} catch (e) {
  console.log('Error:', e.message);
}
