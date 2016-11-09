/*jshint esversion: 6 */
/*jshint -W058 */

const PORT = 8000;
const CHAT = 'chat.txt';
var   http = require('http'),
		fs = require('fs'),
		url = require('url');

//объявляем функцию qParse для парсинга URL
qParse = requrl => url.parse(requrl, true).query;

module.exports = (()=>{
	function inner(){
		this.start = whatToDo=>{
			http.createServer((req, res)=>{
				// выбирае маршрут
				switch ( req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase()  ) {
				case '/add':
					res.writeHead(200, {'Content-Type': 'text/html'});
					var addMessage = qParse(req.url).addMessage;
					// если поступило на вход сообщение
					if (addMessage){
						// уведомляем в веб-интерфейс
						res.write(`<h2>Сообщение отправляется...</h2>`);   
						// пишем в файл
						fs.appendFile(CHAT, '\n'+addMessage, (err)=>{
							res.end(`<h2>Сообщение ${addMessage} отправлено!</h2>`);   
							if (err) throw err;
						});
					} else {
						// ну а если сообщения нет
						res.end(`<h2>Нечего добавлять</h2>`);   
					}
					whatToDo('add called!');
					break;

				// при обновлении
				case '/read':
					res.writeHead(200, {'Content-Type': 'text/html'});
					//считываем содержимое файла
					fs.readFile(CHAT, (err, data)=>{
						// выводит всё что считали
						res.end(`<pre>${data}</pre>`);
						if (err) throw err;
					});  
					whatToDo('read called!');
					break;
				
				case '/about' :
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.end( '<h2>Это простой чат на сыром NodeJS</h2>' );   
					whatToDo('about called!');
					break;

				// если путь в URL не указан, отдаём веб-мору из файла
				default:
					res.writeHead(200, {'Content-Type': 'text/html'});
					fs.readFile('public/page.html', (err, what)=>{
						res.end(what);
						if (err) throw err;
					});
					break;
			}	
		}).listen(process.env.PORT || PORT,()=>{
			console.log(`--> Port ${  process.env.PORT || PORT  } listening!`);
			});
		};   
	}
  return new inner;
})();