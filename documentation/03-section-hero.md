# Polenta Web — Section Hero

## Composición

Hero (`#hero`) ocupa el alto disponible del viewport dentro del bloque inicial,
una vez descontada la announcement bar y la navbar. Sus animaciones están
centradas vertical y horizontalmente: `asterisk-blue` se ubica detrás y
`logo-type-changing` por encima.

Ambos recursos se reproducen sin sonido y en loop. Comienzan después de que
termina la transición de salida del loader. Cuando el usuario solicita reducir
el movimiento, no se inicia su reproducción automática.

Cada animación conserva ambas fuentes con canal alfa. En iPhone e iPad se
prioriza el MOV ProRes 4444 original, porque WebKit puede aceptar WebM pero
decodificar su alfa como negro. En el resto de los navegadores se mantiene
WebM como fuente principal y MOV como fallback.

## Fondo

Hero no incorpora un fondo propio: utiliza la misma variante responsive del
video de fondo compartido con Tickets. La variante activa se actualiza al
cambiar el breakpoint o la orientación.
