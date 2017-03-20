#include <ctime>
#include <string>
#include <iostream>
#include <string.h>

class timer 
{ 
    struct timespec ts_start, ts_end; 
    clockid_t id; 
    public: 
    void start() { 
        clock_gettime(id, &ts_start); 
    } 
    void stop() { 
        clock_gettime(id, &ts_end); 
    } 
    timer(clockid_t clock = CLOCK_MONOTONIC) { 
        id = clock; 
        start(); 
    } 
    friend std::ostream & operator<<(std::ostream& os, const timer &t); 
}; 
  
std::ostream & operator<<(std::ostream& os, const timer &t) 
{ 
    unsigned long ns = (t.ts_end.tv_sec - t.ts_start.tv_sec) * 1000000000 + t.ts_end.tv_nsec - t.ts_start.tv_nsec; 
    std::string ext = "ns"; 
    if (ns >= 10000) { 
        ns /= 1000; 
        ext = "us"; 
    } 
    if (ns >= 10000) { 
        ns /= 1000; 
        ext = "ms"; 
    } 
    if (ns >= 10000) { 
        ns /= 1000; 
        ext = "s"; 
    } 
  
    os << ns << " " << ext; 
  
    return os; 
}
