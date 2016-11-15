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

router
	// для корневого маршрута
	.route('/')
		// для GET
		.get((req,res) => {
			// если запрошен JSON
			if (req.query.json !== undefined) {
				// отсылаем JSON
				res.send(JSON.stringify(usersData.users));
			} else {
				// смотрим, надо ли показывать формы добавления или 
				if (req.query.add !== undefined) {
					// рендерим шаблон users, передавая ему массив под именем users
					// и элемент form-add, наличие которого проверяется в шаблоне
					res.render('users',{
						"users": usersData.users
						,"form-add": true
					});					
				} else if (req.query.remove !== undefined) {
					res.render('users',{
						"users": usersData.users
						,"form-remove": true
					});					
				} else {
					res.render('users',{
						"users": usersData.users
					});								
				}
			}
		})
		//для POST запросов
		.post((req,res) => {
			usersData.users.push(
				{
					"login": req.body.login,
					"pass": req.body.pass
				}
			);
			jsonfile.writeFile(data,usersData, err=>{
				if (err) throw(err);
				res.send(`Был добавлен пользователь ${req.body.login} с паролем ${req.body.pass}`)
			})
		})
router
	.route('/:login')
		.delete((req,res) =>{
			let removed = _.remove(usersData.users, function(u){
				// эта функция-предикат возвращает true только для тех, кого хотим удалить
				return u.login === req.params.login
			});
			jsonfile.writeFile(data,usersData, err=>{
				if (err) throw(err);
				if (removed.length>0){
					res.send(`Был удалён пользователь ${req.params.login}`);
				} else {
					res.send(`Ни одного пользователя с логином ${req.params.login} не найдено`);
				}
			})
		})
		.get((req,res) =>{
			userFound = _.find(usersData.users, { 'login': req.params.login});
			if (userFound !== undefined){
				res.render('userDetails',{
					"user": userFound
				});
			} else {
				res.send(`<h1>Пользователь с логином ${req.params.login} не найден</h1>`);
			}
		})
module.exports = router;