from HabitTracker import HabitTracker


#---------------------------------------------------------------------------
#                                       Constants                     
#---------------------------------------------------------------------------
CERT_FILEPATH = "certificates\\firmwareSimulatorThing.cert.pem"
PRI_KEY_FILEPATH = "certificates\\firmwareSimulatorThing.private.key"
CA_FILEPATH = "certificates\\root.pem"
AWS_ENDPOINT = "a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"


tracker = HabitTracker(client_id="firmwareSimulatorThing",
                       end_point=AWS_ENDPOINT,
                       certficate_file_path=CERT_FILEPATH,
                       private_key_file_path=PRI_KEY_FILEPATH,
                       root_pem_file_path=CA_FILEPATH)



tracker.interaction_listener("JSON","firmwareSimulatorThing")



#---------------------------------------------------------------------------
#                         Sources & Important links                        
#---------------------------------------------------------------------------

############################################################################
# AWS python sdk v2:                        https://github.com/aws/aws-iot-device-sdk-python-v2
# Activating venv:                          https://stackoverflow.com/questions/18713086/virtualenv-wont-activate-on-windows
#                                           https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/
# Simple keylogger in python:               https://medium.com/@meetmeonmail04/a-simple-keylogger-using-python-ddc39d04b5ab
# AWS connecting a device to AWS IoT core:  https://docs.aws.amazon.com/iot/latest/developerguide/sdk-tutorials.html#sdk-tutorials-prepare


