# Polenta Web — Section Hero

## Composición

Hero (`#hero`) ocupa el alto disponible del viewport dentro del bloque inicial,
una vez descontada la announcement bar y la navbar. Sus animaciones están
centradas vertical y horizontalmente: `asterisk-blue` se ubica detrás y
`logo-type-changing` por encima.

Ambos recursos se reproducen sin sonido y en loop. Comienzan después de que
termina la transición de salida del loader. Cuando el usuario solicita reducir
el movimiento, no se inicia su reproducción automática.

Los archivos WebM conservan alfa para los navegadores que lo soportan. En
iPhone y iPad se utilizan las variantes HEVC con alfa, exportadas desde los
ProRes 4444, ya que Safari y los navegadores basados en WebKit no preservan el
alfa de WebM.

## Fondo

Hero no incorpora un fondo propio: utiliza la misma variante responsive del
video de fondo compartido con Tickets. La variante activa se actualiza al
cambiar el breakpoint o la orientación.
