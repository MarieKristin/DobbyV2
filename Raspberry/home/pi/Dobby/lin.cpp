#include "stdafx.h"
#include "Frame.h"
#include "Lin.h"


Lin::Lin()
{
	printf("[OK] Konstruktor\n");
}

Lin::~Lin()
{
	printf("[OK] Destruktor\n");
}

void Lin::setInitFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	initFrame.setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::setActivationFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	activationFrame.setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::setMessageFrame(int data0, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8)
{
	messageFrame.setContent(data0, data1, data2, data3, data4, data5, data6, data7, data8);
}

void Lin::getFrame() {
	activationFrame.getContent();
}
