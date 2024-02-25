from habitTracker import habitTracker


#---------------------------------------------------------------------------
#                                       Constants                     
#---------------------------------------------------------------------------
CERT_FILEPATH = "certficates\\firmwareSimulatorThing.cert.pem"
PRI_KEY_FILEPATH = "certficates\\firmwareSimulatorThing.private.key"
CA_FILEPATH = "certficates\\root.pem"
AWS_ENDPOINT = "a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"

tracker = habitTracker(awsEndPoint = AWS_ENDPOINT,
                        awsClientID = "firmwareSimulator",
                        certificateFilePath = CERT_FILEPATH,
                        privateKeyFilePath = PRI_KEY_FILEPATH,
                        rootPemFileFilePath = CA_FILEPATH)

tracker.interactionListener()



#---------------------------------------------------------------------------
#                         Sources & Important links                        
#---------------------------------------------------------------------------

############################################################################
# AWS python sdk v2:                        https://github.com/aws/aws-iot-device-sdk-python-v2
# Activating venv:                          https://stackoverflow.com/questions/18713086/virtualenv-wont-activate-on-windows
#                                           https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/
# Simple keylogger in python:               https://medium.com/@meetmeonmail04/a-simple-keylogger-using-python-ddc39d04b5ab
# AWS connecting a device to AWS IoT core:  https://docs.aws.amazon.com/iot/latest/developerguide/sdk-tutorials.html#sdk-tutorials-prepare


