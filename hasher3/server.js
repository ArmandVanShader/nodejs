/*jshint esversion: 6 */
/*jshint -W058 */

const PORT = 8001;
// подключаем модули
var	  express = require('express'),
			md5 = require('md5'),
			sha1 = require('sha1'),
			// инициализируем фреймворк 
			app = express();
		 
module.exports = (()=>{
	function inner(){
		this.start = whatToDo=>{
		// настраиваем маршрут на статичесие файлы
		app.use(express.static(__dirname + '/public'))
			 .use((req, res, next)=>next());
			 
		// Объявляем маршрут для GET-запроса на корень
		app.get('/', (req, res) => {
			// посылаем контент из статичного файла
			res.sendFile(__dirname + '/public/page.html');
		}); 

		// объявляем маршрут для AJAX запросов со страницы
		app.get('/api', (req, res) => {
			// устанавливаем хэдеры, разрешающие кросс-доменные запросы CORS
			res.set({'Access-Control-Allow-Origin': '*'}); 
			// получаем переменные из GET-параметров, если не заданы - берём дефолт
			let src = req.query.src || (new Date()).toString(),
			    hash = req.query.hash || 'md5',
			    type = req.query.type || 'plain',
			    // задаём доступные хэши и способ их вычисления
					avalHashes = {'md5' : md5(src), 'sha1': sha1(src)}; // !!!
			// если запрошен json
			if (type==='json') {
				// создаём пустой объект
				let response = {};
				// создаём ему свойство с именем хэша и значением
				response[hash]=avalHashes[hash];
				// отправляем в виде json
				res.json(response);
			} else {
				// просто отправляем значение хэша
				res.send(avalHashes[hash]);
			} 
		}); 

		// устанавливаем порт
		app.set('port',  process.env.port||PORT )
		   //запускаем приложение с прослушкой на указанном порту
		   .listen( app.get('port') ,()=>console.log(`--> Port ${ app.get('port') } listening!!!`));
		};   
	}
	return new inner;
})();

