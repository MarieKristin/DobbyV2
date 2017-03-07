#include "stdafx.h"
#include "Frame.h"

Frame::Frame()
{

}

Frame::Frame(int _id)
{
	printf("Konstrutkor Frame\n");
	id = _id;
}

Frame::~Frame()
{
}

void Frame::setContent(int data0, int data1, int data2, int data3, int data4,
	int data5, int data6, int data7, int data8) {
	content[0] = data0;
	content[1] = data1;
	content[2] = data2;
	content[3] = data3;
	content[4] = data4;
	content[5] = data5;
	content[6] = data6;
	content[7] = data7;
	content[8] = data8;
	content[9] = getChecksum();
}

int Frame::getChecksum() {
	int summe = 0;

	for (int i = 1; i < 9; i++) {
		summe += content[i];
		if (summe > 255) {
			summe -= 255;
		}
	}
	return ~summe & 0xFF;
}

void Frame::getContent() {
	for (size_t i = 0; i < 10; i++)
	{
		printf("Wert: %d\n", content[i]);
	}
}
