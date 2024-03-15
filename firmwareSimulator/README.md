# FIRMWARE SIMULATOR
## About
The firmware simulator is a software that emulates the behaviour of the firmware. It is used to make the development process more independent of the progress of the firmware / hardware development. 

The simulator can eventually also be used to test the functionality of the system without the need for the dodecahedron / habit tracker.

## Current capabilities
In its current iteration the simulator can:
- Be used to select a specific side (1 of 12) and thereby triggering the actions associated with that side
    - For instance selecting side 0 will result in the habit associated with side 0 to be triggered which will result in some data being sent to an AWS MQTT5 topic.
- Send messages to specific MQTT5 topics
- Subscribe to specific MQTT5 topics (but at the moment nothing is done with messages received from that topic)
