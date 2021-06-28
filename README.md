# API-DISNEY

## Consideraciones generales:

Para correr la aplicacion es necesario ejecutar el script de MySQL para crear la base de datos que se encuentra dentro de la carpeta SQL SCRIPT. El script tambien crea tres filas con datos dentro de tabla de genero ya que es la unica que no tiene endpoint, por lo demas no tiene ningun dato. Considerar que quizas tenga que cambiar datos de acceso a la base de datos segun como este configurado su localhost, para hacer eso entrar en /database/config/config.js.

Para instalar las dependencias hay que ejecutar por consola en la raiz del proyecto "npm install". Para levantar el servidor ejecutar el comando "npm start". El servidor corre en el puerto 3000.

Se dejan, tambien, imagenes guardadas para hacer pruebas.

En la coleccion de POSTMAN se encuentran listados todos los endpoint posibles de la API. Se encuentran deshabilitados los posibles BODIES y QUERIES. Se especificara en cada ENDPOINT aquellos datos que sean obligatorios y aquellos que son opcionales. Tanto para datos dentro del BODY como para datos dentro de QUERY se entiende que cuando no quiero enviar un dato opcional debo deshabilitar ese QUERY o BODY especifico, es decir, no debo enviar ese dato puesto que si lo hago el middleware retornara error ya que no puede haber campos vacios.

Todas las respuestas estan estructuradas de la siguiente manera:


Un objeto JSON con dos propiedades: data e info. Dentro de body se devuelve la información que el usuario pide a la API, o un mensaje (o array de mensajes) de error si falla   el pedido. Dentro de info se puede encontrar informacion complementaria al pedido, como puede ser status, tamaño de la informacion devuelta o endpoints.


## **AUTH:**

Antes de realizar cualquier llamado a la API es necesario registrarse y luego loguearse para poder recibir un token. Este token se guarda en una cookie junto con el email (ambos encriptados). Cualquier pedido subsiguiente (que no se al endpoint auth) debe tener un header Authorization del tipo Bearer con el token. En caso de error se detallara la razon en la respuesta.

### **REGISTER - http://localhost:3000/auth/register (POST)**

Recibe parametros por BODY (x-www-form-urlencoded), no por PARAMS ni QUERY. Los parametros son: email y contraseña (OBLIGATORIOS). La contraseña debe tener minimo ocho caracteres, una mayúscula y una minúscula.

En caso de éxito, retorna dentro de DATA un mensaje avisando que se creo exitosamente el usuario. Dentro de INFO devolvemos el status del request.
  
### **LOGIN - http://localhost:3000/auth/login (POST)**

Recibe parametros por BODY (x-www-form-urlencoded), no por PARAMS ni QUERY. Los parametros son: email y contraseña (OBLIGATORIOS).

En caso de éxito, retorna dentro de DATA un objeto que contiene el email y el token del usuario. Dentro de INFO devolvemos el status del request.

## **CHARACTER**:

### **GET CHARACTER - http://localhost:3000/characters/ID (GET)**

No recibe parametros ni por BODY ni por QUERY. Recibe un parametro obligatoria que es el ID.

En caso de éxito, dentro de DATA retorna toda la informacion del personaje, dentro de INFO retrona el status.

### **GET CHARACTERS - http://localhost:3000/characters (GET)**
    
No recibe ningun PARAM ni BODY. Puede recibir QUERYS, todas ellas OPCIONALES. Son: name, age, weight, movies[] -ARRAY-. Una ausencia de QUERYS implica que se van a mostrar     todos los personajes.

Es posible combinar las QUERYS para hacer busquedas mas exactas.

En caso de éxito, dentro de DATA retorna un array de objetos con tantos objetos como coincidencias haya, dentro de estos podemos encontrar el logo y el nombre de cada uno de     los personajes. Dentro de INFO retrona el status y la cantidad de resultados.

### **CREATE CHARACTER - http://localhost:3000/characters (POST)**
  
No recibe ningun PARAM ni QUERY. Recibe un BODY a traves de form data. Los datos que es posible pasar son: name, age, weight, lore (OBLIGATORIOS) y logo -JPG, JPEG, PNG-,       movies[] -ARRAY- (OPCIONALES).

En caso de exito retorna dentro de DATA un mensaje diciendo que X personaje fue creado correctamente. Dentro de INFO devuelve el status.

### **EDIT CHARACTER - http://localhost:3000/characters/ID?_method=PUT (PUT)**
  
Recibe un QUERY que sirve para sobrescribir el método (usando method override), un PARAM para indicar el personaje a editar y un BODY (form data). Los datos que es posible       pasar son: name, age, weight, lore (OBLIGATORIOS), logo -JPG, JPEG, PNG- y movies[] -ARRAY- (OPCIONAL) 

Se realiza la suposición de que el front-end va a rellenar los inputs con los datos actuales del personaje, es decir, que se volveran a enviar todos los datos. Es importante     en el caso de las relaciones con peliculas ya que el controlador lo que hace es eliminar todas las relaciones existentes y crearlas de nueva, actualizadas. No sera problema     si no se quiere editar las relaciones pero sí buscamos adicionar una a las ya existentes solo quedara la pelicula escogida relacionada con el personaje, mientras que las         otras se borraran.

Por el lado de la imagen, si no se envia una nueva la imagen que queda es la que ya existia, por lo que deja de ser un campo obligatorio. En caso de que se envie una nueva,     se reemplazará.

En caso de exito retorna dentro de DATA un mensaje diciendo que X personaje fue editado correctamente. Dentro de INFO devuelve el status.

### **DELETE CHARACTER - http://localhost:3000/characters/ID?_method=DELETE (DELETE)**

Recibe un QUERY que sirve para sobrescribir el método (usando method override), un PARAM para indicar el personaje a editar, no recibe un BODY.

El DELETE borra todas las relaciones que ese personaje tenia, para no generar errores, asi como la imagen dentro del folder correspondiente (a traves de file system)

En caso de exito retorna dentro de DATA un mensaje diciendo que X personaje fue eliminado correctamente. Dentro de INFO devuelve el status.
  
## **MOVIES:**

### **GET MOVIE - http://localhost:3000/movies/ID (GET)**
  
No recibe parametros ni por BODY ni por QUERY. Recibe un parametro obligatoria que es el ID.

En caso de éxito, dentro de DATA retorna toda la informacion de la pelicula, dentro de INFO retrona el status.

### **GET MOVIES - http://localhost:3000/movies (GET)**
  
No recibe ningun PARAM ni BODY. Puede recibir QUERYS, todas ellas OPCIONALES. Son: order, genre, title. Una ausencia de QUERYS implica que se van a mostrar todas las             peliculas.

Es posible combinar las QUERYS para hacer busquedas mas exactas.

En caso de éxito, dentro de DATA retorna un array de objetos con tantos objetos como coincidencias haya, dentro de estos podemos encontrar el logo y el título de cada una de     las peliculas. Dentro de INFO retrona el status y la cantidad de resultados.

### **CREATE MOVIE - http://localhost:3000/movies (POST)**
  
No recibe ningun PARAM ni QUERY. Recibe un BODY a traves de form data. Los datos que es posible pasar son: title, rating -0 a 10, FLOAT-, logo -JPG, JPEG, PNG-                   (OBLIGATORIOS) y genre, characters[] -ARRAY-  (OPCIONALES).

En caso de exito retorna dentro de DATA un mensaje diciendo que X pelicula fue creada correctamente. Dentro de INFO devuelve el status.

### **EDIT MOVIE - http://localhost:3000/movies/ID?_method=PUT (PUT)**
  
Recibe un QUERY que sirve para sobrescribir el método (usando method override), un PARAM para indicar la pelicula a editar y un BODY (form data). Los datos que es posible       pasar son: ntitle, rating -0 a 10, FLOAT- (OBLIGATORIOS) y genre, characters[] -ARRAY-, logo -JPG, JPEG, PNG- (OPCIONALES)

Se realiza la suposición de que el front-end va a rellenar los inputs con los datos actuales de la pelicula, es decir, que se volveran a enviar todos los datos. Es               importante en el caso de las relaciones con personaje ya que el controlador lo que hace es eliminar todas las relaciones existentes y crearlas de nueva, actualizadas. No         sera problema si NO se quieren editar las relaciones pero sí buscamos adicionar una a las ya existentes solo quedara el personaje escogida relacionada con la pelicula,           mientras que los otros se borraran.

Por el lado de la imagen, si no se envia una nueva la imagen que queda es la que ya existia, por lo que deja de ser un campo obligatorio. En caso de que se envie una nueva,     se reemplazará.

En caso de exito retorna dentro de DATA un mensaje diciendo que X pelicula fue editada correctamente. Dentro de INFO devuelve el status.

### **DELETE MOVIE - http://localhost:3000/movies/ID?_method=DELETE (DELETE)**
  
Recibe un QUERY que sirve para sobrescribir el método (usando method override), un PARAM para indicar el personaje a editar, no recibe un BODY.

El DELETE borra todas las relaciones que esa pelicula tenia, para no generar errores, asi como la imagen dentro del folder correspondiente (a traves de file system)

En caso de exito retorna dentro de DATA un mensaje diciendo que X pelicula fue eliminada correctamente. Dentro de INFO devuelve el status.


  
  
  
