#pragma once
class Frame
{
public:
	Frame();
	~Frame();

	void setContent(int data0, int data1, int data2, int data3, int data4,
		int data5, int data6, int data7, int data8);
	int* getFrame();
	void setID(int _id);
	int getSize();

private:
	int id;
	int content[10];
	int getChecksum();

};
