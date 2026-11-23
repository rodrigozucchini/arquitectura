// MODEL: datos y reglas. No sabe nada de HTTP ni HTML.
const tareas = [{ id: 1, titulo: 'Aprender MVC', hecha: false }];
let seq = 2;

module.exports = {
  todas: () => tareas,
  agregar(titulo) {
    if (!titulo || titulo.length < 3) throw new Error('Título muy corto');
    tareas.push({ id: seq++, titulo, hecha: false });
  },
  alternar(id) {
    const t = tareas.find((x) => x.id === id);
    if (t) t.hecha = !t.hecha;
  },
};
