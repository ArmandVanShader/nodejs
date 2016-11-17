// что нам нужно от этого кода
// POST /users/ {login, pass}
// DELETE /users/:id
// GET /users/:login

let router = require('express').Router()
		//подклюаем модуль path для небольшого хака с путями
		,path = require('path')
		// получаем путь к файлу с данными
		,data = path.dirname(require.main.filename) + '/data/users.json'
		//читаем данные из файла и переводим их в объект
    ,usersData = require(data)
		//подключаем модуль для удобной записи в JSON файл
    ,jsonfile = require('jsonfile')
		//подключаем модуль для удобного удаления из файла
    ,_ = require('lodash')
    // // особым образом получаем встроенный вебсервер для socket.io
    // ,http = require('http').Server(app)
    // // передаём вебсервер библиотеке сокетов
    // ,io = require('socket.io')(http);
    // // библиотека сама генерирует маршрут /socket.io


// у этого модуля всё задом наперёд, потому что он принимает в себя ещё и опции
// сам модуль являеся функцией с входным параметром,
// а возвращать он будет как обычный маршрутизатор, обхект router
module.exports = function(options){
router
	// для корневого маршрута
	.route('/')
		// для метода GET
		.get((req,res) => {
			// если запрошен JSON
			if (req.query.json !== undefined) {
				// отсылаем JSON
				res.json(usersData.users);
			} else {
				// смотрим, надо ли показывать формы добавления 
				if (req.query.add !== undefined) {
					// рендерим шаблон users, передавая ему массив под именем users
					// и элемент form-add, наличие которого проверяется в шаблоне
					res.render('users',{
						"users": usersData.users
						,"form-add": true
					});
				// смотрим, надо ли показывать форму удаления
				} else if (req.query.remove !== undefined) {
					res.render('users',{
						"users": usersData.users
						,"form-remove": true
					});
				// если ничего не надо, то просто рендерим шаблон
				} else {
					res.render('users',{
						"users": usersData.users
					});								
				}
			}
		})
		//для POST запросов
		.post((req,res) => {
			// добавляем в массив новые значения, полученные из параметров POST запроса
			usersData.users.push(
				{
					"login": req.body.login,
					"pass": req.body.pass
				}
			);
			// пишем массив в вайл
			jsonfile.writeFile(data,usersData, err=>{
				if (err) throw(err);
				// в сокет отсылаем пользователю обновлённый список пользователей
				// объект io был передан этому модулю как параметр функции,
				// поэтому находится он внутри options
				options.io.emit('userListUpdated', JSON.stringify(usersData.users));
				// в ответе высылаем уведомление
				res.send(`Пользователь ${req.body.login} добавлен`)
			})
		})
router
	// для маршрутов, содержащих любое слово после корня, это будет логин
	.route('/:login')
		// для метода Delete
		.delete((req,res) =>{
			// удаляем из массива всех, кто подходит по функции-предикату
			let removed = _.remove(usersData.users, function(u){
				// эта функция-предикат возвращает true только для тех, кого хотим удалить
				// то есть тех, чей логин содержится в URL
				return u.login === req.params.login
			});
			// записываем обновлённый массив в файл
			jsonfile.writeFile(data,usersData, err=>{
				if (err) throw(err);
				// если кто-то был удалён
				if (removed.length>0){
					// в сокет отсылаем пользователю обновлённый список пользователей
					options.io.emit('userListUpdated', JSON.stringify(usersData.users));					
					res.send(`Пользователь ${req.params.login} удалён`);
				} else {
					res.send(`Пользователь ${req.params.login} не найдено`);
				}
			})
		})
		// для метода GET
		.get((req,res) =>{
			// ищем пользователя по логину, который указан в URL
			userFound = _.find(usersData.users, { 'login': req.params.login});
			// если он найден
			if (userFound !== undefined){
				// рендерим шаблон с ним
				res.render('userDetails',{
					"user": userFound
				});
			} else {
				// иначе просто отсылаем текст-заглушку
				res.send(`<h1>Пользователь с логином ${req.params.login} не найден</h1>`);
			}
		})
	// весь модуль должен возвращать роутер, это ведь модуль-маршрутизатор
	return router
}
