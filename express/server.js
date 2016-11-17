/*jshint esversion: 6 */
/*jshint -W058 */

var	  express = require('express'),
			app = express(),

      // особым образом получаем встроенный вебсервер для socket.io
      http = require('http').Server(app),
      // передаём вебсервер библиотеке сокетов
      io = require('socket.io')(http);
      // библиотека сама генерирует маршрут /socket.io

			//подклюаем наши маршрутизаторы
			my_routes = require('./routes/my/index.js'),
			grabber_routes = require('./routes/grabber/index.js'),
			users_routes = require('./routes/users/index.js')({io}),
			
			// подключаем шаблонизатор
			handlebars = require('express-handlebars')
				// задаём раскладку (лэйаут) по умолчанию
				// а также инициализируем механизм секций
				.create({
					defaultLayout: 'main',
					helpers: {
						section: function(name,options){
							if(!this._sections) this._sections = {};
							this._sections[name] = options.fn(this);
							return null;
						}
					}
				});

		 
module.exports = (()=>{
	function inner(){
		this.start = whatToDo=>{
		// Подключаем middleware. Исполняется по порядку сверху вниз.

		// указаннойываем движок шаблонизатора
		app.engine('handlebars', handlebars.engine);
		app.set('view engine','handlebars');

		//подключаем парсер для параметров POST запросов, используется в /users
		app.use(require('body-parser').urlencoded({"extended": true}));

		// настраиваем Express на поиск статических файлов в папке паблик
		// Вся статика хранится в /public, а юзеру доступна в корне
		app.use(express.static(__dirname + '/public'))
		   .use((req, res, next)=>next());

		//устанавливаем маршрут для GET на корень
		app.get('/',(req,res)=>{
			// просто отсылаем текст
			res.send(`
			<h1>Добро пожаловать в это чудное приложение!</h1>
			<p>Что здесь можно сделать?</p>
			<ul>
				<li><a href="/api">Просто получить какой-то JSON</a></li>
				<li><a href="/my/about">Попробовать маршруты из внешнего модуля</a></li>
				<li><a href="/my/name/username">Увидеть маршруты с переменными в URL</a></li>
				<li><a href="/grabber/http%3A%2F%2Fya.ru">Сграбить главную страницу Яндекса</a></li>
				<li><a href="/secret/wrongPassword">Попытаться нелегально попасть в секретную зону</a></li>
				<li><a href="/secret/qwerty">Успешно попасть в секретную зону</a></li>
				<li><a href="/thisPageIsAwsome">Попробовать шаблонизатор в действии</a></li>
				<li><a href="/my/wrongRoute">Попытаться пройти на неверному пути и получить 404</a></li>
				<li><a href="/addRoute/get/customRoute"><s>Динамически создать кастомный маршрут</s></a> <i>Не работают при наличии универсальных маршрутов</i></li>
				<li><a href="/customRoute">Проверить кастомный маршрут</a> <i>При наличии универсальных маршрутов работает как п.7</i></li>
				<li><a href="/users"><b>Испытать базу данных пользователей</b></a></li>
			</ul>
  		`);
		})

		// объявляем GET маршрут для /api
		app.get('/api', (req, res) => {
			// Устанавливаем заголовки
			res.set({'Access-Control-Allow-Origin': '*'});
			// Отсылаем какой-то JSON
			res.json({'status':'running'});
		}); 
	
		// подключаем маршрутизатор для пути /my
		app.use('/my',my_routes);

		// подключаем маршрутизатор для пути /grabber
		app.use('/grabber',grabber_routes);

		// подключаем маршрутизатор для пути /users
		app.use('/users',users_routes);


		// Днамический подключатор маршрутов по запросу
		// Увы, динамические маршруты добавляются в конец стека, после обработчиков ошибок 404 и 500
		// поэтому, что бы это была динамическая маршрутизация, нужно отключить все универсальные маршруты
		app.get('/addRoute/:method/:route',(req,res)=>{
			// этп лямбла подключ
			let cb = r => (req,res) => {res.send(`Маршрут /${r} был динамически добавлен!`)}
			app[req.params.method]('/'+req.params.route, cb.call(null, req.params.route));
			res['send']('Маршрут подключён');
		})

		// Простейшая функция для порверки авторизации пользователя
		let check = (req,res,next) => {
			if (req.params.pass !== 'qwerty') {
				res.redirect('/bad');
				res.redirect('/bad');
			} else {
				next();
			}
		};

		// маршрут с условным доступом с проверкой некоторых условий
		// пускает по адресу /secret/qwerty
		app.get('/secret/:pass', check, (req,res) => {
			res.send('<h1>Добро пожаловать в секретную часть!</h1>');
		})

		// маршрут, куда шлём всех непоняятных личностей
		app.get('/bad', (req,res) => {
			res.send('<h1 style="color: red;">Вы неопознаны!</h1>');
		})

		// Универсальный маршрут
		// устанавливаем маршрут для GET корня и любого слова поле.
		// Важно, что этот маршрут объявлен после других корневых маршрутов,
		// поэтому не перезаписывает маршруты типа /my или /secret
		app.get('/:something',(req,res)=>{
			// рендерим страницу с указанной вьюхой
			res.render('root',
				{
					// передаём внутрь шаблона значение переменной text
					text: req.params.something
				}
				);
		})

		//Универсальный маршрут
		//добавляем маршруты для ошибочных ситуаций 404
		//в данном примере этот маршрут отработает только вне корня
		// т.к. универсальынй маршрут на корне сработает первым
		app.use(function(req,res,next){
			res.status(404);
			res.render('404',
				{
					text: req.url
				}
			);
		})

		//Универсальный маршрут
		//добавляем маршруты для ошибочных ситуаций 500
		//используем для этого стрелочную функцию (для красоты кода)
		app.use((err,req,res,next) => {
			res
				.status(500)
				.send(`500 Server internal error\n<br>\n${err}`);
		})

		//устанавливаем порт для подключения
		app.set('port', 8001); 
		// для нужд soket.io слушать будет http, а не app
		//запускаем веб-сервер и слушаем указанный порт
		http.listen( app.get('port') ,()=>console.log(`--> Сервер успешно запущен на ${ app.get('port') } порту.`));
		};   
	}
	return new inner;
})();