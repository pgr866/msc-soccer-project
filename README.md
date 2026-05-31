# msc-soccer-project

## Especificación del proyecto

El objetivo de este proyecto es desarrollar una aplicación para la gestión de jugadores y estadísticas de fútbol.
Los usuarios no registrados pueden (1) registrarse en la aplicación, (2) acceder a un listado completo de
jugadores y (3) buscar jugadores. Dicha búsqueda se debe realizar a partir de una base de datos local. Los
criterios de búsqueda permitirán filtrar por nombre del jugador, equipo/liga y fecha de alta en el sistema.

Al acceder a un jugador, se mostrarán sus datos y una imagen identificativa. Se pueden añadir comentarios sobre
cada jugador, con los campos: autor, comentario (máx. 1000 caracteres) y valoración (0 a 5 estrellas).

Los usuarios registrados, previo inicio de sesión, pueden:

- Insertar nuevos jugadores desde API externa: Buscando en una API externa de fútbol (p.e. [API-Football](https://www.api-football.com/)) para seleccionar e importar datos. A partir de los resultados de la búsqueda, los usuarios podrán seleccionar uno o varios jugadores para realizar su inserción en la base de datos local.
- Insertar nuevo jugador desde formulario: Añadiendo la imagen del jugador mediante URL o el acceso a la cámara del dispositivo.
- Solicitar la generación de un “Equipo Ideal” basado en los jugadores insertados mediante el uso de LLMs con Groq o Google AI Studio ([enlace](https://github.com/ualcnsa/groq)).
- Visualizar noticias de jugadores: Haciendo uso de un consumidor de noticias en CORBA.

Existirá también un usuario administrador que podrá:
- Dar de alta nuevas noticias de jugadores: Haciendo uso de un productor de noticias en CORBA.
- Editar y eliminar jugadores, así como borrar comentarios.

Siempre que se lleve a cabo una operación de inserción, tanto de jugadores como de comentarios, se almacenará la geolocalización del cliente desde el cual se está realizando dicha operación. Esta geolocalización será editable en el caso de insertar nuevo jugador desde formulario para situar el jugador en un mapa.

Todas las funcionalidades (excepto las relacionadas con CORBA) deben poder resolverse desde dos backends: uno implementado con el stack tecnológico de la asignatura TRWM y otro con el de la asignatura DWSC. En el front-end debe existir un componente tipo toggle para poder conmutar el destino de las peticiones.

La navegación en la aplicación debe permitir flexibilidad en el acceso a la funcionalidad. La aplicación debe tener un estilo personalizado en todos los componentes y páginas. Además, debe incluir un icono y una pantalla de carga asociados al estilo de la aplicación.

Se deben implementar pruebas unitarias para los componentes y los servicios desarrollados. Adicionalmente, se deben implementar las siguientes pruebas e2e: inicio de sesión, registro, inserción de un nuevo elemento a partir del formulario, y búsqueda de elementos.

## Diagrama de Casos de Uso

![Diagrama de Casos de Uso](docs/diagrams/UCD.drawio.svg)

## Diagrama Entidad-Relación

![Diagrama Entidad-Relación](docs/diagrams/ERD.drawio.svg)

## Vistas

```
usuario no registrado:

/login
  inputs correo y contraseña
  botón iniciar sesión
  enlace a registrarse (/signup)

/signup
  inputs correo y contraseña
  botón registrarse
  enlace a iniciar sesión (/login)


cualquier rol:

cabecera -> toggle de backends    botón iniciar (/login) / cerrar sesión (/players)

/players
  barra de búsqueda de jugadores por nombre, equipo o liga
  filtro fecha de alta -> dos datepicker: fecha inicio, fecha fin   botón importar jugadores (/import-players)   botón crear jugador (/create-player)
  lista de jugadores -> cada ítem lleva a detalles jugador (/player-detail/:id)

/player-detail/:id
  solo administrador: botón crear noticia jugador (/create-news)    botón editar jugador (/edit-player)    botón eliminar jugador
  imagen
  datos...
  mapa no interactivo con chincheta
  coordenadas de la chincheta
  text area para comentar (maximo 1000 caracteres)
  cinco estrellas para seleccionar [0-5]    botón comentar (pide geolocalizacion)
  lista comentarios (reciente primero)
  solo administrador: botón borrar comentario


usuario registrado y administrador:

tabs: noticias    jugadores   equipazos

/import-players
  barra de búsqueda de jugador por nombre en api externa
  lista de 20 primeros resultados -> cada ítem tiene checkbox, imagen y datos de jugador
  botón importar seleccionados en base de datos

/create-player
  imagen
  input con url de la imagen    botón cámara
  inputs de datos...
  mapa con chincheta, esta se puede mover
  coordenadas de la chincheta (por defecto ubicación actual)    botón resetear a ubicación actual
  botón crear jugador

/dream-teams
  botón generar equipazo con ia
  lista de equipazos (recientes primero) -> cada ítem despliega la lista de jugadores -> cada jugador con enlace a sus detalles (/player-detail/:id)

/news
  título
  fecha   tags    nombre jugador
  contenido

administrador:

/create-news/:playerName
  Jugador Relacionado: playerName
  input título    input jugador relacionado
  input descripcion
  input etiquetas
  botón publicar noticia
  
  Establecer limite de noticias
  input limite
  botón limitar

/edit-player
  reutilizar formulario de /create-player pero con datos ya rellenos y botón actualizar
```

## Lista de endpoints

| HttpVerb | Endpoint                 | Params                       | Response                           | Role                |
| -------- | ------------------------ | ---------------------------- | ---------------------------------- | ------------------- |
| GET      | /api/players             | query?, dateStart?, dateEnd? | 200 OK [Player]                    | Any                 |
| GET      | /api/players/summary     | -                            | 200 OK [PlayerSummary]             | Any                 |
| GET      | /api/players/:id         | id                           | 200 OK {PlayerWithComments}        | Any                 |
| GET      | /api/players/name/:id    | id                           | 200 OK {PlayerName}                | Any                 |
| POST     | /api/players             | {Player}*                    | 201 Created {Player}               | Authenticated/Admin |
| PUT      | /api/players/:id         | id, {Player}*                | 200 OK {Player}                    | Admin               |
| DELETE   | /api/players/:id         | id                           | 204 No Content                     | Admin               |
| GET      | /api/players/search      | query?                       | 200 OK [ExternalPlayerDTO]         | Authenticated/Admin |
| POST     | /api/players/import      | {PlayersImportRequestDTO}    | 201 Created [Player]               | Authenticated/Admin |
| GET      | /api/comments/player/:id | id                           | 200 OK [Comment]                   | Any                 |
| POST     | /api/comments/player/:id | id, {CommentRequest}         | 201 Created {Comment}              | Any                 |
| DELETE   | /api/comments/:id        | id                           | 204 No Content                     | Admin               |
| GET      | /api/dream-teams         | -                            | 200 OK [DreamTeamWithPlayers]      | Authenticated/Admin |
| POST     | /api/dream-teams         | -                            | 201 Created {DreamTeamWithPlayers} | Authenticated/Admin |
| POST     | /api/corba/send	        | title, player, desc, labels  | 200 OK {message}                   |	Admin               |
| POST     | /api/corba/read          | -                            | 200 OK {message, news}	            | Authenticated/Admin |
| POST     | /api/corba/receive       | -	                           | 200 OK {message, news}	            | Authenticated/Admin |
| POST     | /api/corba/limit         | limit                        | 200 OK {message, limit, current}   |	Admin               |

* Player sin `createdAt`, ya que es generado automáticamente por el servidor.

## Llamada [API-Football](https://www.api-football.com/)

- Búsqueda de jugadores: `https://v3.football.api-sports.io/players/profiles?search=ney`

Para los seleccionados:

- Se obtiene id del equipo que está en 2026 (que no incluya su nacionalidad): `https://v3.football.api-sports.io/players/teams?player=276`
- Se obtiene la liga en la que está el equipo en 2026 (elegir la de tipo liga, que no sea del mundo y mayor duración): `https://v3.football.api-sports.io/leagues?team=128`

## Llamadas a CORBA

```bash
➜  ~ curl 'http://localhost:8084/' --data-raw 'title=Titulo&player=Nombre+del+Jugador&description=Descripcion+de+ejemplo&labels=%23etiqueta1+%23etiqueta2&action=Enviar&format=json'

{"status":"success", "message":"La noticia se ha insertado correctamente (2/5)", "current":2, "max":5}

➜  ~ curl 'http://localhost:8084/' --data-raw 'action=Leer&format=json'

{"status":"success", "message":"La noticia se ha leido correctamente. Noticias restantes: 2/5", "news": {"title":"Titulo", "description":"Descripcion de ejemplo", "date":"31/05/2026", "player":"Nombre del Jugador", "labels":"#etiqueta1 #etiqueta2"}}

➜  ~ curl 'http://localhost:8084/' --data-raw 'action=Recibir&format=json'

{"status":"success", "message":"La noticia se ha recibido correctamente. Noticias restantes: 1/5", "news": {"title":"Titulo", "description":"Descripcion de ejemplo", "date":"31/05/2026", "player":"Nombre del Jugador", "labels":"#etiqueta1 #etiqueta2"}}

➜  ~ curl 'http://localhost:8084/' --data-raw 'limit=10&action=Limitar&format=json'

{"status":"success", "message":"El nuevo limite del buffer es 10. Numero de noticias: 1", "limit":10, "current":1}
```

## Obtener token de Firebase en desarrollo

```bash
curl -s 'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key' \
  -H 'Content-Type: application/json' \
  --data-binary '{"email": "admin@example.com", "password": "123456"}' | \
  grep -o '"idToken":"[^"]*"' | cut -d'"' -f4
```
