
#include <WebSocketKeys.h>



websocketkeys::WebSocketKeys(){

}

websocketkeys::~WebSocketKeys(){

}

//int WebSocketKeys::websocketkeys(map<std::string, multiValue>&Key) { 
 
//	struct multiValue WEBCAMERA = {webcamera()}


//	} 

int* websocketkeys::webcamera(){

	if (test == 0) {
		ioControl->blinken(27, 100);
	}
	test = 7; 


}

