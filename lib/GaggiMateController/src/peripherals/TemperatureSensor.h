#ifndef TEMPERATURESENSOR_H
#define TEMPERATURESENSOR_H

class TemperatureSensor {
  public:
    virtual float read();
    virtual bool isErrorState();
    virtual float read2();
};

#endif // TEMPERATURESENSOR_H
