let router = require('express').Router()
		// модуль request будет грабить страницы
    request = require('request');

// объявляем функцию с промисом
let resolveOuterRoute = (url) => new Promise(
	(resolve,reject) => {
		// грабим страницу
		request(url, function(error, response, body){
			// если всё хорошо
			if (!error && response.statusCode==200){
				// успешно возвращаем награбленное
				resolve(body)
			}
			// иначе
			else{
				// с отказом возвращаем ошибку
				reject(error);
				// в данном примере отказ никак не обрабатываетсяя, что есть плохо
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
			// так как ограбление происходит долго, мы будем использовать промисы
			// поэтому все действия обёрнуты в функцию с промисом
			resolveOuterRoute(req.params.grabUrl)
				// когда ограбление успешно закончится, награбленное будут отправлены пользователю
				.then(data=>res.send(data));

		})
module.exports = router;