console.log('\nPhantom tester is in da house!\n');
var page = require('webpage').create();

var baseUrl = 'http://localhost:8000/api';
// описываем кейсы: вариативную часть URL и ожидаемый результат
var data = [
	['src=12345&hash=md5','827ccb0eea8a706c4c34a16891f84e7b']
	,['src=12345&hash=sha1','8cb2237d0679ca88db6464eac60da96345513964']
	,['src=12345&hash=sha1&type=json','{"sha1":"8cb2237d0679ca88db6464eac60da96345513964"}']
	,['src=12345','Illegal hash request attempt!']
]

function test(testCase) {
  // формируем адрес
   var finalUrl = baseUrl + "?" + data[testCase][0];
   // открваем страницу
   page.open(finalUrl, function(status) {
      if (status !== 'success') {
        console.log('Опаньки! Нету такой страницы!');
      } else {
        // запускаем открытую страницу и получаем её контент
        var response = page.evaluate(function() {
            return document.body.textContent;
        });
        // выводим результаты, сравнивая при этом эталон и результат
        console.log(
        	"Test case: " + finalUrl + "\n"+
					"Received:  " + response +"\n"+
					"Expected:  " + data[testCase][1]+"\n"+
        	"Result:    " + ((response == data[testCase][1]) ? "success" : "FAIL !!!") + "\n\n"
        );

        //если только что поработали с последним из входных тестирующих наборов завершаем работу
        if (testCase == data.length-1) {
          phantom.exit();
        } else {
          // рекурсивная часть: вызываем саму функцию уже со следующим кейсом
          test(testCase+1);
        }
      }
   });
}

// начинаем тест с кейса №0
test(0);