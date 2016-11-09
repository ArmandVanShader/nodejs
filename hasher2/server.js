/*jshint esversion: 6 */
/*jshint -W058 */
const PORT = 8000;
var   http = require('http'),
      fs = require('fs'),
      md5 = require('md5'),
      sha1 = require('sha1'),
      url =  require('url'),
 	  
//объявляем функцию для парсинга параметров запроса      
qParse = requrl => url.parse(requrl, true).query;

module.exports = (()=>{
   function inner(){
      this.start = whatToDo=>{
		  http.createServer((req, res)=>{
		  	// парсим URL регуляркой для определения маршрута
			  switch ( req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase()  ) {
				  case '/api' :
				  	// определяем исходную строку
					  var src = qParse(req.url).src;
					  // если не задана - берём зардкоденную
					  if (src === undefined ) src='12345';
					  
					  // определяем тип хэша и тип ответа
				  	var type  = qParse(req.url).type,
				  	    hash  = qParse(req.url).hash,
				  	    // создаём массив возможных хэшей и способами их вычисления
				  	    avalHashes = {'md5' : md5(src), 'sha1': sha1(src)};
				  	// если не задан тип хэша, выводим ошибку 
			  	  if (!avalHashes.hasOwnProperty(hash)) {
			  	   	res.writeHead(500, {'Content-Type': 'text/html','Access-Control-Allow-Origin': '*'});
			  	   	res.end('<h1>Illegal hash request attempt!</h1>');
			  	  } else {
				  	  if (type==='json') {
				  	  	// указываем заголовки
				  	   	res.writeHead(200, {
				  	   	  'Content-Type': 'application/json',
				  	   	  'Access-Control-Allow-Origin': '*'
				  	   	});
				  	   	// создаём пустой ответ
				  	    var resp = {};
		  	    		// задаём ответу атрибут с именем нужного хэша
		  	    		// и значением, которые вычисленно согласно алгоритму
		  	   	    resp[hash] = avalHashes[hash];
				  	   	// преобразуем массив в JSON и отправляем
				  	   	res.end(JSON.stringify(resp));
				  	  } else {
				  	  	// указываем заголовки
				  	   	res.writeHead(200, {
				  	   		'Content-Type': 'text/plain',
				  	   		'Access-Control-Allow-Origin': '*'
				  	   	});
				  	   	// просто отправляем
				  	   	res.end(avalHashes[hash]);
				  	  }
				  	}
					  whatToDo('API hash called!');
				    break;

				  default:
				    res.writeHead(200, {'Content-Type': 'text/html'});
				    fs.readFile('public/page.html', (err, what)=>{
				      if (err) throw err;
				      res.write(what);
				      res.end();
				    });
			 }
			
		  }).listen(PORT,()=>
		  	        console.log(`--> Port ${PORT} listening!`)
	    	);
      };   
    }
  return new inner;
})();