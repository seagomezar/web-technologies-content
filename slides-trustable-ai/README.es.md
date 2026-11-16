# Presentación del Workshop: Construyendo IA Confiable a 100 MPH (DevFest Pereira 2026)

[English](README.md) · Español

Presentación interactiva completa de **37 diapositivas** (90 minutos) diseñada con la identidad oficial de **Web @DevFest Pereira 2026** para dirigir paso a paso el Codelab oficial de Google [**Building Trustable AI at 100 MPH**](https://codelabs.developers.google.com/codelabs/trustable-at-100-mph?hl=en), coautoría de **Sebastián Gómez**, Krupa Galiya, Todd Kerpelman y Ocupop.

> **Repositorio oficial actualizado del taller:** [**https://github.com/seagomezar/trustable-ai-codelab**](https://github.com/seagomezar/trustable-ai-codelab) *(anunciado directamente en la Diapositiva 2 para reemplazar el enlace antiguo inactivo del Codelab).*

## Archivos principales

- `index.html?lang=es` — Presentación principal de 37 diapositivas (funciona tanto con servidor HTTP como directamente con `file://` sin internet).
- `presenter.html?lang=es` — Vista sincronizada del facilitador con reloj de 90 minutos, vista previa actual y siguiente, y guion detallado paso a paso (también se abre pulsando **`P`** desde la presentación).
- `live-sim.html?lang=es` — Simulador Split-Brain interactivo embebido en la diapositiva 18 y ejecutable de forma autónoma (5 personas de coach, modo lluvia `0.6g`, física ON/OFF y Círculo de Fricción en vivo).
- `../workshops/trustable-ai-codelab/` y [`github.com/seagomezar/trustable-ai-codelab`](https://github.com/seagomezar/trustable-ai-codelab) — Código completo reparado, probado y actualizado a 2026 (`streaming-telemetry-server` FastAPI SSE + `koru-application` React/Vite + `@google/genai ^3.3.0`).

## Atajos de teclado durante el taller

- **`→` / `Espacio` / `PageDown` / `Enter`:** avanza el paso resaltado de código o build, y luego pasa a la siguiente diapositiva.
- **`←` / `PageUp` / `Backspace`:** retrocede un paso o diapositiva.
- **`Shift + →` / `Shift + ←`:** salta directamente entre diapositivas completas.
- **`P`:** abre la ventana sincronizada del Presentador / Facilitador.
- **`F`:** alterna pantalla completa.
- **`C`:** oculta o muestra la barra inferior de controles.

## Personalizar sede o duración

```text
slides-trustable-ai/index.html?lang=es&city=Pereira%202026&minutes=90
```
