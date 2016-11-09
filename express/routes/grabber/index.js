let router = require('express').Router()
    request = require('request');


let resolveOuterRoute = (url) => new Promise(
	(resolve,reject) => {
		request(url, function(error, response, body){
			if (!error && response.statusCode==200){
				resolve(body)
			}
			else{
				reject(error);
			}
		});
	}
);


router
	// описываем маршрут корня
	.get('/', (req,res) =>{
		res.send('Не указано, кого грабить');
	})
	// описываем маршрут для остального
	.route('/:grabUrl')
		.get((req,res) =>{
			resolveOuterRoute(req.params.grabUrl)
				.then(x=>res.send(x));

		})
module.exports = router;