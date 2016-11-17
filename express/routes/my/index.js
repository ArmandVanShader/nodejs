var router = require('express').Router();
router
	// описываем маршрут для my)
	.get('/', (req,res) =>{
		res.send('Это корень маршрута my');
	})
	// описываем маршрут для /my/about
	.get('/about', (req,res) =>{
		res.send('Это маршрут about');
	})
	// для маршрутов вида /my/name/here-goes-custom-name
	.route('/name/:name')
		.get((req,res) =>{
			res.send(`Привет, ${req.params.name}. Ты сделал запрос GET`);
			// параметр name парсится из маршрута средствами регулярок внутри Express
		})
		.post((req,res) =>{
			res.send(`Привет, ${req.params.name}. Ты сделал запрос POST!`);
		})
module.exports = router;