# FIRMWARE SIMULATOR

## About

The firmware simulator is a software that emulates the behaviour of the firmware. It is used to make the development process more independent of the progress of the firmware / hardware development.

The simulator can eventually also be used to test the functionality of the system without the need for the dodecahedron / habit tracker.

## Current capabilities

In its current iteration the simulator can:

- Be used to select a specific side (1 of 12) and thereby triggering the actions associated with that side
  - For instance selecting side 0 will result in the habit associated with side 0 to be triggered which will result in some data being sent to an AWS MQTT5 topic.
- Send messages to specific MQTT5 topics using either `JSON` or `protocol buffers` format.
- Subscribe to specific MQTT5 topics (but at the moment nothing is done with messages received from that topic)

## Files & Folders

- certificates (folder)
  - Contains all the certificates and policies necessary for the simulator to interact with AWS IoT. (not really included here for security purposes)
    - firmwareSimulatorThing-Policy
    - firmwareSimulatorThing.cert.pem
    - firmwareSimulatorThing.private.key
    - firmwareSimulatorThing.public.key
- protoco_buffers_messages (folder)
  - Contains the .proto file describing the format of the protocol buffers message being sent by the simulator to AWS
    - fromFirmwareToBackend.proto
- fromFirmwareToBackend_pb2.py (file)
  - The python code generated from the .proto file, used to send messages in protocol buffer format by the simulator
- HabitTracker.py (file)
  - The python class representing the simulator
- main.py (file)
  - The file in which the habit tracker object is created and used to simulate the firmware.
  - Uses the certificates, so it is important to update the file paths of the certificates according to your own file structure
