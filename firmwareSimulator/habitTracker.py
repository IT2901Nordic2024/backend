# Imports
import keyboard
from datetime import datetime
import re
from awscrt import  mqtt5
from awsiot import mqtt5_client_builder
import json
from concurrent.futures import Future
import time
from fromFirmwareToBackend_pb2 import habit_data as firmwareMessage

import base64


class HabitTracker:
    """Class that represents the dodecahedron habit tracker"""
    def __init__(self, client_id, end_point, certficate_file_path, private_key_file_path, root_pem_file_path):
        # The representation of the dodecahedron and its sides in this simulator
        self._dodecahedron = { 
        0:{
            "id": 123,
            "type":"count",
            "name":"coffee"
        },
        1:{
            "id": "",
            "type":"",
            "name":""
        },
        2:{
            "id": "",
            "type":"",
            "name":""
        },
        3:{
            "id": "",
            "type":"",
            "name":""
        },
        4:{
            "id": "",
            "type":"",
            "name":""
        },
        5:{
            "id": "",
            "type":"",
            "name":""
        },
        6:{
            "id": "",
            "type":"",
            "name":""
        }
        ,
        7:{
            "id": "",
            "type":"",
            "name":""
        },
        8:{
            "id": "",
            "type":"",
            "name":""
        }
        ,
        9:{
            "id": "",
            "type":"",
            "name":""
        },
        10:{
            "id": "",
            "type":"",
            "name":""
        },
        11:{
            "id": "",
            "type":"",
            "name":""
        }
    }
        self.client_id = client_id
        self.end_point = end_point
        self.certficate_file_path = certficate_file_path
        self.private_key_file_path = private_key_file_path
        self.root_pem_file_path = root_pem_file_path
        self.client = None
        self.future_stopped = Future()
        self.future_connection_success = Future()


    #############################################################
    #                     MQTT related methods                  #
    #                            Start                          #
    #############################################################

    def create_client(self):
        self.client = mqtt5_client_builder.mtls_from_path(
            endpoint = self.end_point,
            port = 8883,
            cert_filepath = self.certficate_file_path,
            pri_key_filepath= self.private_key_file_path,
            ca_filepath = self.root_pem_file_path,
            on_publish_received = self.on_publish_received,
            on_lifecycle_stopped = self. on_lifecycle_stopped,
            on_lifecycle_connection_succes = self.on_lifecycle_connection_succes,
            on_lifecycle_connection_failure = self.on_lifecycle_connection_failure,
            client_id = self.client_id
        )

    def on_publish_received(self, publish_packet_data):
        publish_packet = publish_packet_data.publish_packet
        assert isinstance(publish_packet, mqtt5.PublishPacket)
        print("Received message from topic {}: {}".format(publish_packet.topic,publish_packet.payload))

    def on_lifecycle_stopped(self, lifecycle_stopped_data:mqtt5.LifecycleStoppedData):
        print("Lifecycle Stopped")
        self.future_stopped.set_result(lifecycle_stopped_data)
    
    def on_lifecycle_connection_succes(self, lifecycle_connection_succes_data: mqtt5.LifecycleConnectSuccessData):
        print("Lifecycle Connection Success")
        self.future_connection_success.set_result(lifecycle_connection_succes_data)
    
    def on_lifecycle_connection_failure(self, lifecycle_connection_failure: mqtt5.LifecycleConnectFailureData):
        print("Lifecycle Connection Failure")
        print("Connection failed with exception:{}".format(lifecycle_connection_failure.exception))


    def publish_message(self, format, mqtt_topic, habit_id, data):
        message = {
            "deviceTimestamp": int(round(datetime.timestamp(datetime.now()))),
            "habitId": habit_id,
            "value": data
        }

        match format:
            case "JSON":
                print("publishing message in JSON format")
                self.client.publish(mqtt5.PublishPacket(
                    topic = mqtt_topic,
                    payload = json.dumps(message),
                    qos = mqtt5.QoS.AT_LEAST_ONCE
                ))
                print("Message published")

            # For more information about how to send protobuf messages with python see:
            # https://www.freecodecamp.org/news/googles-protocol-buffers-in-python/
            case "proto_buff":
                payload = firmwareMessage(device_timestamp=message["deviceTimestamp"], habit_id=message["habitId"], data=message["value"]).SerializeToString()
                print("publishing message in protocol buffers format")
                self.client.publish(mqtt5.PublishPacket(
                    topic = mqtt_topic,
                    payload = payload,
                    qos = mqtt5.QoS.AT_LEAST_ONCE
                ))
                print("payload: {}".format(payload))
                print("Sent to topic {}".format(mqtt_topic))
            case _:
                raise Exception("The provided format must either be JSON or proto_buff")
    
    def subscribe(self,topic):
        """Method that allows the HabitTracker to subscribe to an MQTT5 topic.
        The method takes as its input the topic the HabitTracker is to subscribe to."""
        print("Trying to subscribe to {}".format(topic))
        subscribe_future = self.client.subscribe(subscribe_packet=mqtt5.SubscribePacket(
            subscriptions=[mqtt5.Subscription(
                topic_filter=topic,
                qos=mqtt5.QoS.AT_LEAST_ONCE
            )]
        ))
        print("subscribe_future: ", subscribe_future.__dict__)
        try:
            suback = subscribe_future.result(timeout=30)
            print("Subscribed to {}, with {}".format(topic, suback.reason_codes))
        except:
            print("subscribe future failed: ", subscribe_future.__dict__)

    def unsubscribe(self, topic):
        """A method that allows the HabitTracker to unsubscribe from an MQTT5 topic.
        The method takes as its input the topic the HabitTracker is to unsubscribe from."""
        unsubscribe_future = self.client.unsubscribe(unsubscribe_packet=mqtt5.UnsubackPacket(
            topic_filters=[topic]))
        unsuback = unsubscribe_future.result(timeout=100)
        print("Unsubscribed from {}, with {}".format(topic, unsuback.reason_codes))
    
    def start_connection(self):
        self.client.start()
    
    def stop_connection(self):
        self.client.stop()

    #############################################################
    #                     MQTT related methods                  #
    #                             Stop                          #
    #############################################################  
        
    

    #############################################################
    #                Dodecahedron interaction methods           #
    #                             Start                         #
    ############################################################# 
    
    def value_transformer(self, value):
        """Function that takes in a value and does something with it.
        At the moment that is to transform its string value to an integer value
        and return that or to throw an error if that does not work."""
        try:
            return int(value)  # If a number key is pressed return its value as a number
        except:
            print("Invalid input! Input must be a number.")   # Otherwise show the user that the wrong input was provided
    
    def get_habit_type(self,side):
        """Function that takes an integer, that represents a side of the dodecahedron habit tracker, as input and 
        returns the type of habit associated with that side. If the input does not match any side of the dodecahedron, the 
        function throws an error."""
        if side in list(self._dodecahedron.keys()):
            return self._dodecahedron.get(side).get("type")
        else:
            raise Exception("The provided input does not correspond to any side of the device / dodecahedron")
    
    def get_habit_id(self,side):
        """Method that gets the id of the habit associated with the provided side"""
        if side in list(self._dodecahedron.keys()):
            return self._dodecahedron.get(side).get("id")
        else:
            raise Exception("The provided input does not correspond to any side of the device / dodecahedron")
    
    def execute_habit(self, habit_type):
        """Function that takes in one input, the habit type, for instance count, and performs the corresponding actions and returns the output.
        It was necessary to call the input variable for habitType, because type is a python keyword."""
        match habit_type:
            case "count":
                return 1                                 # Returns an increment value of 1
            case "timer":
                now = datetime.now()
                return int(round(datetime.timestamp(now)))  # Returns the current timestamp as integer
            case _:                                      
                raise Exception("This habit type does not exist")   # Throws an error if the provided habit type does not exist


    def interaction_listener(self, message_format, mqtt_topic):
        key_buffer = [] # Stores the user input

        print("Press ESCAPE to terminate program or Enter a side to interact with: ")

        while keyboard.is_pressed('esc') == False:
            if len(key_buffer) >= 2 or keyboard.is_pressed('enter'):
                side = ""
                for value in key_buffer:
                    side = side + value
                print("side: ", side) # Providing the user with some feedback, specifically showing the selected habit tracker side
                key_buffer.clear()    # Clearing the buffer to make way for new entries

            #------Preparing data to be sent to AWS IoT core------
                habit = self.value_transformer(value=side)  # Passing on the side selection and storing the returned value
                print("type of habit: ", type(habit))
                print("habit: ", habit)
                habit_id = self.get_habit_id(side=habit)    # The id of the habit
                habit_type = self.get_habit_type(side=habit)# The type of habit
                habit_data = self.execute_habit(habit_type=habit_type) # Execute action associated with habit / execute habit and store the return value as data to be sent to AWS IoT core MQTT broker

            #-------------------MQTT-------------------
                #self.start_connection() # Start connection to MQTT broker
                self.publish_message(format=message_format,mqtt_topic=mqtt_topic,habit_id=habit_id,data=habit_data)
                time.sleep(1)
                print("Press ESCAPE to terminate program or Enter a side to interact with: ")

    
            happening = keyboard.read_event()   # Listening to user input 
            if happening.event_type == "down" and re.search("[0-9]", happening.name): # Only accepts user input that corresponds to numbers 7 digits between 0 and 9.
                key_buffer.append(happening.name)
                print("keyBuffer: ", key_buffer)     
        
        self.stop_connection()
        self.future_stopped.result(timeout=100)
        print("Escape was pressed, program is terminated!")


    #############################################################
    #                Dodecahedron interaction methods           #
    #                             Stop                          #
    ############################################################# 