# FIRMWARE SIMULATOR

- [About](#about)
- [Nomeclature](#nomenclature)
- [Current capabilities](#current-capabilities)
- [Files & Folders](#files--folders)
- [Setup](#setup)
- [Using the firmware simulator](#using-the-firmware-simulator)

## [About](#about)

The firmware simulator is part of the development of a habit tracker based on the Thingy:91 by Nordic Semiconductor. The simulator is a piece of software that aims to emulate the functionality of the habit tracker (physical device) and its associated firmware (software). Having a simulator decouples the development of the cloud infrastructure (backend) and the website (frontend) from the development of the firmware. This is, among other situations, usefull when there is only a limited amount of habit trackers available. Also, it allows for a more rapid trial and error of new features, as it it generally is much faster making changes to the simulator than to the actual firmware. Finally, the firmware simulator is a nice way for new users and developers to just test out the project.

## [Nomenclature](#nomenclature)

The following terms are being used in this document:

- Simulator : The firmware simulator
- Habit : A thing that can be tracked using the habit tracker or the simulator. Each habit has its own name and can have one of a limited number of habit types, for instance **COUNT** and **TIME**.
- COUNT : A type of habit that tracks the occurance of something, for instance the number of cups of coffe one has consumed.
- TIME : A type of habit that tracks the time spent on something, for instance the length of time a meeting takes.
- Protobuf / Protocol buffers : The data format which is used to send data from the simulator (and the habit tracker) to the cloud / backend infrastructure.
- Thing : A represenetation of the habit tracker in the AWS cloud. Has policies, certificates associated with it and can have a device / thing shadow associated with it.
- Device / thing shadow: A representation of a things state
- Certificates: Some form of credentials used to authenticate various parts of the software and the user.
- Policies: A JSON document that specifies what a given resource is allowed to do and / or has access to.

## [Current capabilities](#current-capabilities)

In its current configuration the simulator has the following features

- It can be used to send habit data to the backend infrastructure.
  - A habit of type TIME and a habit of type COUNT are hard coded in from the start to the sides 0 and 1. In fact the simulator does not support habit types other than COUNT and TIME.
    - This is because the firmware does not support other habit types at this point in time.
- Receive updates / configurations from the backend infrastructure the same way as the firware / habit tracker. This is done by subscribing to the correct AWS MQTT topic (see config.py) and then updating the JSON file storing the configuration for the simulator.

## [Files & Folders](#files--folders)

- **backend** (folder)

  - _**Some other folders**_
  - **firmwareSimulator** (folder)

    - **certificates** (folder)

      - Contains all the certificates and policies necessary for the simulator to interact with AWS IoT. (not really included here for security purposes)
        - _FirmwareSimulatorThing.cert.pem_ (file)
        - _FirmwareSimulatorThing.private.key_ (file)
        - _FirmwareSimulatorThing.public.key_ (file)
        - _root.pem_ (file)
          - The Amazon Root CA 1
      - .gitkeep
        - GitHub does not store empty folders, as the certificates are not stored on GitHub the .gitKeep file is there to have something in the folder so that GitHub stores it.

    - **protoco_buffers_messages** (folder)

      - Contains the .proto file describing the format of the protocol buffers message being sent by the simulator to AWS and its assoicated .desc file.
        - _fromFirmwareToBackend.proto_ (file)
        - _fromFirmwareToBackend.desc_ (file)

    - **src** (folder)

      - _fromFirmwareToBackend_pb2.py_ (file)
        - The python code generated from the .proto file, used to encode and decode messages to / from protobuf format.
      - _FirmwareSimulator.py_ (file)
        - The python class representing the simulator
      - _main.py_ (file)
        - The file in which the FirmwareSimulator object is created and used to simulate the firmware.
        - Uses the certificates
      - _config.py_ (file)
        - A file used to store all the configurations and file paths required by some of the other files in src folder.
      - _setup.py_ (file)
        - Creates the AWS thing and its (classic) shadow

  - _**Some other folders**_

## [Setup](#setup)

This section will explain how to setup everything related to the simulator.

### [Get the code](#get-the-code)

Clone this GitHub repository. Then open it in your favourite code editor / IDE.

### [AWS](#aws)

| cd into the backend folder |
| -------------------------- |

For the simulator and the backend in general to work, it is necessary that you follow this AWS guide for getting started with AWS CDK.
The guide shows you, among other things, how to create an AWS account, configure programmatic access and how to setup the AWS CLI.

The AWS Guide: https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html

### [firmwareSimulator](#firmware-simulator)

| cd into the firmwareSimulator folder |
| ------------------------------------ |

Ensure that you are in the firmwareSimulator folder.

### [setup.py](#setup)

- Run the setup.py file. (Only run it once)

  - It can be useful to log into you AWS console for this.
    - Under _IoT Core_ in the menu on the left side go to <ins>Manage</ins> `-->` <ins>All devices</ins> `-->` <ins>Things</ins>. Here you should see **FirmwareSimulatorThing** (if you have not done any renaming) after running _setup.py_.
    - Clicking on **FirmwareSimulatorThing** `-->` <ins>Certificates</ins> you can see all the certificates associated with **FirmwareSimulatorThing**.
      - Selecting the **certificate** link you will be sent to a details page where you get more information avout the certificate. Additionally, you can see the **policies** assoicated with the certificate.
        - Clicking on one of the **policies** you be sent to a details page for that policy.
          - It will show you the active version of the policy. It will show you what access the policy provides.
    - Clicking on **FirmwareSimulatorThing** `-->` <ins>Device Shadows</ins> you can see all the device shadows assoicated with the **FirmwareSimulatorThing**.
      - Clicking on one of the shadows you will be guided to a details page that provides additional information about the device shadow, including the device shadow document. The device shadow document shows the reported state (reported by the habit tracker / simulator), the desired state (desired by the website / frontend) and the delta state (the difference between the other two). Additionally, you can view the MQTT topics associated with the shadow, these are used in the FirmwareSimulator for receiving updates.

- If anything goes wrong / to undo the setup:
  1.  Go into the AWS console.
  2.  Go to the **FirmwareSimulatorThing** `-->` <ins>Device Shadows</ins>
  3.  Select the checkbox assoicated with the device shadow (it is to its left)
  4.  Select **Delete** and delete the shadow
  5.  Go to **FirmwareSimulatorThing** `-->` <ins>Certificates</ins>
  6.  For each certificate, look at its policies
  7.  Detatch each policy from the certificate by selecting its checkbox and choose **Detatch policies**
  8.  Thereafter, for each certificate, select its checkbox and choose **Detatch**
  9.  Go to the **FirmwareSimulatorThing**
  10. Select its checkbox and choose **Delete**
  11. Go to <ins>Manage</ins> `-->` <ins>Security</ins>
  12. Select the policies you detatched earlier and delete them.
  13. Go to <ins>Manage</ins> `-->` <ins>Certificates</ins>
  14. Select the certificates you detatched earlier and deactivate them.
  15. Select the certificates you deactivated in the step above and delete them.
  16. In the firmwareSimulator folder go to the certificates folder.

## [Using the firmware simulator](#using-the-firmware-simulator)

To run the firmware simulator simply run the main.py file.
You can simulate tracking a habit by using the numbers on your keyboard to select a side with teh habit you want to track". You can select sides from 0 to 11. If you want to select a side between 0 and 9 you write the number and then hit `ENTER`. For sides 10 and 11 you write the number and the sides are submitted automatically. For sides to which no habit has been assigned there will be an error thrown if that side is selected.

When running main.py the simulator compares it requests the state of the device shadow associated with its AWS thing and makes necessary updates.

**Note**: While it _is_ possible to select "JSON" as a format to send data in to the backend cloud infrastructure. the infrastructure has changed to support protobuf only. A message can thus still be sent in JSON format, but the data will not be stored. In order to allow for the JSOn data to work properly the "protocolBuffersToJSONRule" in **backend** `-->` **habit-event-storage** ` -->` _habit-event-storage-stack.ts_ needs to be changed to support this.
