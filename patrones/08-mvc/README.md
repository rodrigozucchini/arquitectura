# 08 · MVC (Model-View-Controller)

Separa una aplicación con interfaz en tres responsabilidades:

| Parte | Responsabilidad |
|---|---|
| **Model** | Datos + reglas de negocio |
| **View** | Mostrar los datos |
| **Controller** | Recibir la entrada, actualizar el modelo, elegir la vista |

```
Usuario → Controller → Model
              ↓          ↓
             View ←──────┘
```

Variantes: **MVP** (Presenter maneja la vista pasiva), **MVVM** (ver [patrones/09-mvvm](../09-mvvm)).
Frameworks: Rails, Django (MTV), Laravel, Spring MVC, ASP.NET MVC.

```bash
node server.js   # http://localhost:3005
```
