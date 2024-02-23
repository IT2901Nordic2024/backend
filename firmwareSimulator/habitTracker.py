import keyboard
from datetime import datetime
import re


class habitTracker:
    """Class that represents the dodecahedron habit tracker"""
    def __init__(self):
        # The representation of the dodecahedron and its sides in this simulator
        self.dodecahedron = { 
        0:{
            "id": "",
            "type":"",
            "name":""
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

    
    def valueTransformer(self, value):
        """Function that takes in a value and does something with it.
        At the moment that is to transform its string value to an integer value
        and return that or to throw an error if that does not work."""
        try:
            print(value)
            return int(value)  # If a number key is pressed return its value as a number
        except:
            print("Invalid input! Input must be a number.")   # Otherwise show the user that the wrong input was provided
    
    def getType(self,side):
        """Function that takes an integer, that represents a side of the dodecahedron habit tracker, as input and 
        returns the type of habit associated with that side. If the input does not match any side of the dodecahedron, the 
        function throws an error."""
        if side in list(self.dodecahedron.keys()):
            return self.dodecahedron.get(side).get("type")
        else:
            raise Exception("The provided input does not correspond to any side of the device / dodecahedron")
    
    def interactionListener(self):
        """Function used to simulate interaction with the habit tracker aka interacting with its sides.
        The function listens to the keys being pressed on the keyboard. If the user inputs a number with more than two digits the function passes on the value.
        Since the habit tracker has 12 sides, the side number cannot exceed double digits in length. To select a side with a single digit number (for instance 1), the
         user can enter 1 and then press Enter. """
        
        keyBuffer = [] # Stores the user input
        while keyboard.is_pressed('esc') == False: # Checks if the user wants to terminate the program
            if len(keyBuffer) >= 2 or keyboard.is_pressed('enter'): # Checking whether to submit a side selection
                side = ""
                for value in keyBuffer:
                    side = side + value
                print("side: ", side)       # Providing the user with some feedback, specifically showing the selected habit tracker side
                keyBuffer.clear()           # Clearing the buffer to make way for new entries
                self.valueTransformer(side)     # Passing on the side selection

            happening = keyboard.read_event()   # Listening to user input 
            if happening.event_type == "down" and re.search("[0-9]", happening.name): # Only accepts user input that corresponds to numbers 7 digits between 0 and 9.
                keyBuffer.append(happening.name)
                print("keyBuffer: ", keyBuffer)         
        
        print("Escape was pressed, program is terminated!")

    def habitRunner(habitType):
       """Function that takes in one input, the habit type, for instance count, and performs the corresponding actions and returns the output.
       It was necessary to call the input variable for habitType, because type is a python keyword."""
       match habitType:
            case "count":
                return 1                                 # Returns an increment value of 1
            case "timer":
                return int(round(datetime.timestamp()))  # Returns the current timestamp as integer
            case _:                                      
                raise Exception("This habit type does not exist")   # Throws an error if the provided habit type does not exist
           
    def sendHabitEvent():
        """Function that handles the sending of data from the device to AWS IoT"""
        pass