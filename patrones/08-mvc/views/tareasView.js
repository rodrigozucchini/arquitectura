// VIEW: solo presenta datos (genera HTML). Sin lógica de negocio.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

module.exports = function render(tareas, error) {
  const items = tareas
    .map(
      (t) =>
        `<li><a href="/toggle?id=${t.id}">${t.hecha ? '✅' : '⬜'}</a> ${esc(t.titulo)}</li>`
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>
    <h1>Tareas (MVC)</h1>
    ${error ? `<p style="color:red">${esc(error)}</p>` : ''}
    <ul>${items}</ul>
    <form action="/agregar"><input name="titulo"><button>Agregar</button></form>
  </body></html>`;
};
