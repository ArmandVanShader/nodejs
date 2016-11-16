/*jshint esversion: 6 */
/*jshint -W058 */

var	  express = require('express'),
			app = express(),

			//подклюаем наши маршрутизаторы

			// либо по одному
			my_routes = require('./routes/my/index.js'),
			grabber_routes = require('./routes/grabber/index.js'),
			users_routes = require('./routes/users/index.js'),

			// // либо запихиваем их в массив и потом всех подключим
			// routers = {[
			// 	"/my": "./routes/my/index.js"
			// 	,"grabber": "./routes/grabber/index.js"
			// 	,"users": "./routes/users/index.js"
			// ]}
			
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
		// Подключаем middleware. Приорететное - сверху 

		// указываем движок шаблонизатора
		app.engine('handlebars', handlebars.engine);
		app.set('view engine','handlebars');

		//подключаем парсер для POST запросов, используется в users
		app.use(require('body-parser').urlencoded({"extended": true}));

		// Наставляем Express на поиск статики в папке паблик
		// Вся статика хранится в /public
		// А юзеру доступна в корне
		app.use(express.static(__dirname + '/public'))
		   .use((req, res, next)=>next());

		//устанавливаем маршрут для GET корня и любого слова поле
		app.get('',(req,res)=>{
			res.send('<h1>Добро пожаловат в корень!</h1>');
		})

		// объявляем GET маршрут для /api
		app.get('/api', (req, res) => {
			// Устанавливаем заголовки
			res.set({'Access-Control-Allow-Origin': '*', 'elias': 'goss'});
			// Отсылаем JSON
			res.json({'gossApi':'started ok!'});
		}); 
	
		// подключаем маршрутизатор для пути /my
		app.use('/my',my_routes);

		// подключаем маршрутизатор для пути /grabber
		app.use('/grabber',grabber_routes);

		// подключаем маршрутизатор для пути /users
		app.use('/users',users_routes);

		// подключатор фиксированных маршрутов
		// for (let router in routers){
		// 	app.use(router,require(routers[router]));
		// }

		// Днамический подключатор маршрутов по запросу
		// Увы, динамические маршруты добавляются в конец стека, после обработчиков ошибок 404 и 500
		// поэтому, что бы это была динамическая маршрутизация, нужно отключить универсальные маршруты
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
		//устанавливаем маршрут для GET корня и любого слова поле
		// важно, что этот маршрут объявлен после других корневых
		// поэтому не перезапишет маршруты типа /my или /secret
		app.get('/:something',(req,res)=>{
			// рендерим страницу с указанной вьюхой
			res.render('root',
				{
					text: req.params.something
				}
				);
		})

		//Универсальный маршрут
		//добавляем маршруты для ошибочных ситуаций 404
		//в данном примере этот маршрут отработает только вне корня, т.к. есть универсальынй маршрут
		app.use(function(req,res,next){
			res.status(404);
			// res.send('404 Not found');
			res.render('404',
				{
					text: req.url
				}
			);
		})

		//Универсальный маршрут
		//добавляем маршруты для ошибочных ситуаций 500
		// используем для этого стрелочную функцию
		app.use((err,req,res,next) => {
			res
				.status(500)
				.send(`500 Server internal\n<br>\nerror ${err}`);
		})

		app.set('port',  8001 )		  
			 .listen( app.get('port') ,()=>console.log(`--> Port ${ app.get('port') } listening!!!`));
		};   
	}
	return new inner;
})();

