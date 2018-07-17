import csv

# turns csv file into json format
def parseCsv(filename):
	with open(filename, 'rt') as csvfile:
		jsonData = {"data": []}
		reader = csv.reader(csvfile)
		for row in reader:
			if len(row) > 0 and row[0] == "Start Time:":
				jsonData['startTime'] = row[1]
				break
		for row in reader:
			if len(row) > 0 and row[0] == "Per-Stroke Data:":
				break
		next(reader)
		next(reader)
		next(reader)
		for row in reader:
			if not(row[3] == "---"):
				jsonData['data'].append(row);
		return jsonData

#expects in the form 05:38pm
def startTimeToSec(timeStr):
	amPm = timeStr[-2:]
	isPm = amPm == "pm"
	hours = int(timeStr[:2])
	mins = int(timeStr[3:5])
	timeInSecs = mins*60 + hours*60*60 + (isPm * 12 * 60 * 60)
	return timeInSecs

def elapsedTimeToSec(timeStr):
	hours = int(timeStr[:2])
	mins = int(timeStr[3:5])
	secs = float(timeStr[6:])
	timeInSecs = mins*60 + hours*60*60 + secs
	return timeInSecs

def secToElapsedTime(secs):
	hours = "%02d" % (secs//(60*60))
	secs = secs % (60*60)
	mins = "%02d" % (secs//60)
	secs = secs % 60
	secs = "%04.1f" % (secs)
	timeStr = hours + ":" + mins + ":" + secs
	return timeStr

# 3 is the index of elapsed time
def convertDataElapsedTime(data, offset):
	for row in data["data"]:
		if not(row[3] == "---"):
			row[3] = secToElapsedTime(elapsedTimeToSec(row[3]) + offset)

# 9 is the index of total strokes taken
def convertTotalStrokes(data, offset):
	for row in data["data"]:
		if not(row[9] == "---"):
			row[9] = str(int(row[9]) + offset)

#takes in an array of data jsons and joins them
def joinData(data):
	gap = 20 # 20 seconds
	for subData in data:
		subData["timeSec"] = startTimeToSec(subData["startTime"])
	data.sort(key=lambda x: x["timeSec"])
	elapsedTime = data[0]["data"][-1][3] # ugly but gets data -> last row -> elapsed time index for total elapsed time
	strokes = int(data[0]["data"][-1][9]) # same but with total strokes taken
	for i in range(1, len(data)):
		convertDataElapsedTime(data[i], elapsedTimeToSec(elapsedTime) + gap)
		convertTotalStrokes(data[i], strokes)
		data[0]["data"] += data[i]["data"]
		# joinRows(data[0], data[i])
		elapsedTime = data[0]["data"][-1][3]
		strokes = int(data[0]["data"][-1][9])






