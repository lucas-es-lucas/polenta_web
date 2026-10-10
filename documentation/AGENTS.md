# Polenta Web --- Instrucciones para agentes de desarrollo

## 1. Contexto

Polenta Web es un sitio de Fiesta Polenta.

El proyecto está construido utilizando únicamente HTML, CSS y
JavaScript, con enfoque mobile first y responsive. 

El contexto general del proyecto está documentado en:

`01-proyecto-resumen.md`

## 2. Documentación de referencia

Antes de modificar una parte del proyecto, consultar el documento
correspondiente:

-   `01-proyecto-resumen.md` --- contexto general.
-   `02-bloque-hero-tickets.md` --- comportamiento compartido de Hero +
    Tickets.
-   `03-section-hero.md` --- características propias de Hero.
-   `04-section-tickets.md` --- características propias de Tickets.
-   `CHANGELOG.md` --- evolución relevante del proyecto.

## 3. Modalidad operativa y autorizaciones

Codex funciona principalmente como asistente técnico, analista del
repositorio y colaborador en tareas de documentación y Git.

Puede leer y analizar cualquier archivo del repositorio sin solicitar
autorización adicional. También puede consultar el estado del repositorio,
revisar el historial de Git y comparar ramas mediante operaciones de solo
lectura.

Puede proponer soluciones técnicas, detectar problemas y explicar
alternativas de implementación.

No puede modificar, crear, eliminar ni renombrar archivos sin autorización
expresa. Esta restricción incluye HTML, CSS, SCSS, JavaScript, JSON, assets,
configuraciones y documentación Markdown. También se aplica a scripts,
comandos y herramientas que puedan modificar archivos indirectamente.

Antes de modificar documentación, debe presentar una propuesta e identificar
los archivos afectados. Una autorización para modificar documentación no
autoriza cambios de código.

Cada autorización se limita exclusivamente a la tarea y los archivos
indicados por el usuario. Si durante una tarea autorizada fuera necesario
modificar archivos adicionales, debe informar cuáles son y solicitar
autorización antes de intervenirlos. Ante cualquier duda sobre el alcance de
una autorización, debe consultar antes de actuar.

## 4. Regla principal

No inventar requisitos ni comportamientos que no estén documentados.

Cuando una modificación dependa de información que no aparece en la
documentación:

1.  verificar primero el código existente;
2.  conservar el comportamiento actual cuando sea posible;
3.  si el comportamiento requerido no puede determinarse, pedir una
    definición antes de asumirla.

## 5. Hero + Tickets

Hero y Tickets forman parte de un mismo bloque con video de fondo
compartido.

No modificar de manera aislada el comportamiento del scroll, el
contenedor o el video de fondo sin considerar la relación entre ambas
sections.

## 6. Tickets

La información utilizada para renderizar los tickets se encuentra en
`tickets.js`.

Las fechas futuras se agregan manualmente y las fechas obsoletas se
quitan mediante JavaScript.

No cambiar la lógica de fechas sin verificar primero el comportamiento
existente.

## 7. Documentación

Cuando una implementación autorizada cambie de forma relevante el
comportamiento del proyecto, actualizar `CHANGELOG.md` con autorización
expresa para ese archivo.

Si una modificación autorizada cambia una especificación documentada,
actualizar también el documento `.md` correspondiente con autorización
expresa para ese archivo.

## 8. Flujo de ramas

-   `branch_deploy` es la rama de producción y representa la versión pública
    de `https://fiestapolenta.com/`.
-   Las ramas de funcionalidades se usan para desarrollar y validar cambios
    nuevos. Solo después de la aprobación de Polenta pueden integrarse en
    `branch_deploy`.
-   `main` es la rama estable de referencia. Solo puede recibir merges desde
    `branch_deploy`, una vez que la versión publicada haya permanecido estable
    durante un tiempo razonable.
-   Las ramas que contienen versiones anteriores del sitio se conservan como
    referencia histórica y no deben utilizarse como parte del flujo habitual
    de despliegue.

No hacer commits directos, pushes directos ni merges rutinarios en `main`.
Todo cambio destinado a `main` debe pasar mediante una pull request desde
`branch_deploy`.

Codex no puede ejecutar operaciones Git que modifiquen el estado del
repositorio sin autorización expresa. Esto incluye `git add`, commits,
pushes, merges, rebases, resets, cambios de rama y cualquier otra operación
de escritura.

Antes de cualquier operación Git de escritura, debe verificar la rama actual,
revisar los cambios pendientes y explicar la operación propuesta.

## 9. Formato de commits

Todos los commits del proyecto, sin importar la rama, deben usar este formato:

`YYYYMMDD_N: descripción concisa y clara del cambio`

-   `YYYYMMDD` es la fecha del commit: año de cuatro dígitos, mes de dos
    dígitos y día de dos dígitos.
-   `_` separa la fecha del número de commit.
-   `N` es el número correlativo inmediatamente posterior al número más alto
    utilizado en todo el repositorio, considerando todas las ramas existentes.
-   `:` separa el identificador del mensaje.
-   La descripción explica de forma concisa y clara el contenido del commit.

Ejemplo: `20261002_103: Section Hero: se agregan variantes del video para distintos breakpoints.`

Antes de crear un commit, verificar el número más alto disponible en el
historial de todas las ramas para evitar duplicados.

## 10. Alcance

Estas instrucciones se basan exclusivamente en la documentación
disponible del proyecto. No presuponen una arquitectura de carpetas,
framework, librería o herramienta que no esté documentada.
