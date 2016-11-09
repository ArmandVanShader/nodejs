// POST /users/ {login, pass}
// DELETE /users/:id
// GET /users/

let router = require('express').Router(),
		path = require('path'),
    usersData = require(path.dirname(require.main.filename) + '/data/users.json')

// описываем маршрут корня
router.get('/', (req,res) =>{
	let s = "<ol>";
	for (let user of usersData.users){
		s+= '<li>' +user.login + "</li>";
	}
	s +='</ol>';
	res.send('<h1>Список пользователей</h1><hr>' + s);
});

router.post('/', (req,res) =>{
	//надо доработать, нельзя так просто получить содержимое поста
	let login = req.body.login
	   ,pass = req.body.pass;
	res.send('Posted: ' + login + pass);
});



module.exports = router;