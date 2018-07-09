import sys
import json
import numpy as np
import csvToJson
# import matplotlib.pyplot as plt
import sys
# import time
from testConvolve import getStep, filterData
from itertools import combinations
from json import loads,dumps

jsonData = json.loads(sys.argv[1])

sys.stdout.write(json.dumps(jsonData["data"][0]))
sys.stdout.flush()