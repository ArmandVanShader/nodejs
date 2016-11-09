var   http = require('http'),
      fs = require('fs');
      url = require('url');
      md5 = require('md5');
      sha1 = require('sha1');
      querystring = require('querystring');

http.createServer((req, res)=>{
  	// выполняем парсинг адреса, получаем объект URL
  	// благодаря true нужные нам переменные попадут сразу в объект, а не в строку
  	var parametrs = url.parse(req.url, true).query;

		// если есть исходная строка и она не пуста...
		if("src" in parametrs || parametrs.src===""){
			console.log("Исходная строка задана");
			// если задан верный тип хэша
  		if("hash" in parametrs && (parametrs.hash.toLowerCase()=='md5' || parametrs.hash.toLowerCase()=='sha1')) {
  			//в зависимости от типа хэша вычисляем его
		    switch (parametrs.hash.toLowerCase() ){
		    	case 'md5': 
		    		var hash = md5(parametrs.src);
		    		console.log('Тип хэша MD5');
		    	break;

		    	case 'sha1':
		    		var hash = sha1(parametrs.src);
			    	console.log('Тип хэша SHA1');
		    	break;

		    	default: 
		    		console.log('Неверный тип хэша');
		    	break;
		    }

		    // возвращаем хэш в желаемом виде
		    if("type" in parametrs && parametrs.type.toLowerCase()=='json'){
		    	console.log("Тип ответа -  JSON");
					res.writeHead(200, {
					  'Content-Type': 'application/json',
					  'Cache-Control': 'no-cache'
					});
		    	// возвращаем ответ в JSON
		    	res.write(JSON.stringify({"hash": hash}));
		    	console.log("Ответ выслан.");
		    }
		    else{
		    	console.log("Тип ответа  - plain/text");
					res.writeHead(200, {
					  'Content-Type': 'text/plain',
					  'Cache-Control': 'no-cache'
					});				    	
			    // возвращаем ответ в plain text
		    	res.write(hash);
		    	console.log("Ответ выслан.");
		    }
		}


		else{
			console.log("Тип хэша НЕ задан");
		}
	}
	else{
		console.log("Исходная строка НЕ задана или ПУСТА");
	}

	console.log("\n");
	res.end();

}).listen(8001);
console.log('\nСервер успешно запущен!\n');
