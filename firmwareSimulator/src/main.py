
from FirmwareSimulator import FirmwareSimulator
import config


if __name__ == '__main__':
    #---------------------------------------------------------------------------
    #                              Authentication Constants                  
    #---------------------------------------------------------------------------
    #CERT_FILEPATH = "../firmwareSimulator/certificates/firmwareSimulatorThing.cert.pem"
    #PRI_KEY_FILEPATH = "../firmwareSimulator/certificates/firmwareSimulatorThing.private.key"
    #CA_FILEPATH = "../firmwareSimulator/certificates/root.pem"
    #AWS_ENDPOINT = "a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"

    #---------------------------------------------------------------------------
    #                                      Habit tracker                   
    #---------------------------------------------------------------------------

    tracker = FirmwareSimulator(client_id=config.CLIENT_ID,
                        end_point=config.AWS_ENDPOINT,
                        certficate_file_path=config.CERT_FILE_PATH,
                        private_key_file_path=config.PRI_KEY_FILE_PATH,
                        root_pem_file_path=config.ROOT_PEM_FILE_PATH,
                        path_to_dodecahedron_json=config.PATH_TO_DODECAHEDRON)





    print("Start")
    print("Creating client")
    tracker.create_client()
    print("Client created")
    tracker.start_connection()
    print("Connection established")
    tracker.subscribe(config.AWS_THING_SHADOW_MQTT_UPDATE_DELTA) # Topic where the updates will be published
    tracker.request_update()
    tracker.interaction_listener(message_format="proto_buff",mqtt_topic=config.PUBLISH_MQTT_TOPIC)
    


#---------------------------------------------------------------------------
#                         Sources & Important links                        
#---------------------------------------------------------------------------

############################################################################
# AWS python aws-iot-sdk v2:                            https://github.com/aws/aws-iot-device-sdk-python-v2
# Activating venv:                                      https://stackoverflow.com/questions/18713086/virtualenv-wont-activate-on-windows
#                                                       https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/
# Simple keylogger in python:                           https://medium.com/@meetmeonmail04/a-simple-keylogger-using-python-ddc39d04b5ab
# AWS connecting a device to AWS IoT core:              https://docs.aws.amazon.com/iot/latest/developerguide/sdk-tutorials.html#sdk-tutorials-prepare
# AWS Connect and publish policy examples:              https://docs.aws.amazon.com/iot/latest/developerguide/connect-and-pub.html
# Sending messages / payloads with protocol buffers:    https://faun.pub/using-googles-protocol-buffers-in-python-basics-ac79e9a6e6a9
