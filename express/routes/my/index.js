var router = require('express').Router();
router
	// описываем маршрут для my)
	.get('/', (req,res) =>{
		res.send('THis is my root');
	})
	// описываем маршрут для /my/about
	.get('/about', (req,res) =>{
		res.send('THis is my about page');
	})
	// для маршрутов вида /my/name/here-goes-custom-name
	.route('/name/:name')
		.get((req,res) =>{
			res.send(`Welcome, ${req.params.name}. You have done GET`);
			// параметр name парсится из маршрута средствами регулярок внутри Express
		})
		.post((req,res) =>{
			res.send(`Welcome, ${req.params.name}. You have done POST!`);
		})
module.exports = router;