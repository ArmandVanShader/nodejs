// POST /users/ {login, pass}
// DELETE /users/:id
// GET /users/:login

let router = require('express').Router()
		,path = require('path')
		,data = path.dirname(require.main.filename) + '/data/users.json'
    ,usersData = require(data)
    ,jsonfile = require('jsonfile')
    ,_ = require('lodash')

router
	// для корневого маршрута
	.route('/')
		// для GET
		.get((req,res) => {
			// рендерим шаблон users, передавая ему массив под именем users
			res.render('users',{
				"users": usersData.users
			});
		})
		//для
		.post((req,res) => {
			usersData.users.push(
				{
					"login": req.body.login,
					"pass": req.body.pass
				}
			);
			jsonfile.writeFile(data,usersData, err=>{
				if (err) throw(err);
				res.send(`Был добавлен пользователь ${req.body.login} с паролем ${req.body.password}`)
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
				res.send(`Был удалён пользователь ${req.body.login}`)
			})
		})
		.get((req,res) =>{
			res.send('Ещё не доделано');
		})
module.exports = router;