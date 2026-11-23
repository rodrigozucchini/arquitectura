# 09 · MVVM (Model-View-ViewModel)

Variante de MVC creada por Microsoft (WPF, 2005) para interfaces con **data binding**.

| Parte | Responsabilidad |
|---|---|
| **Model** | Datos y reglas de negocio |
| **ViewModel** | Estado de la pantalla + propiedades derivadas + comandos. **No conoce la View** |
| **View** | Declarativa; se **enlaza** (binding) al ViewModel y se actualiza sola |

```
 View  ◄══ data binding (2 vías) ══►  ViewModel  ───►  Model
 (HTML)                              (estado, comandos)
```

**MVC vs MVP vs MVVM:**
- **MVC:** el Controller recibe la entrada y elige la vista.
- **MVP:** el Presenter actualiza explícitamente una View pasiva (interfaz).
- **MVVM:** nadie actualiza la View a mano: el binding sincroniza automáticamente.

**Ejemplos:** Vue, Angular, Knockout, SwiftUI, Jetpack Compose + ViewModel, WPF/MAUI.

**Ventajas:** ViewModel testeable sin UI, menos código "pegamento", ideal para UIs reactivas.
**Desventajas:** el binding "mágico" es difícil de depurar; overkill para pantallas simples.

Abrí `index.html` en el navegador.
