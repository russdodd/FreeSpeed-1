import numpy as np
import csvToJson
import sys
import csv

def saveToCsv(filenames):
	files = []
	for filename in filenames:
		data = csvToJson.parseCsv(filename)
		data["filename"] = filename
		files.append(data)
	csvToJson.joinData(files)
	fileToWrite = files[0]
	csvData = []
	with open(fileToWrite["filename"], 'rb') as csvfile:
	 	reader = csv.reader(csvfile)
	 	for row in reader:
	 		csvData.append(row)
	 		if len(row) > 0 and row[0] == "Per-Stroke Data:":
	 			break
	 	for i in range(3):
	 		csvData.append(reader.next())
	with open(fileToWrite["filename"][:-4] + " new" + ".csv", 'w') as csvfile:
		csvwriter = csv.writer(csvfile)
		for row in csvData:
			csvwriter.writerow(row)
		for row in fileToWrite["data"]:
			csvwriter.writerow(row)

def main():
	filenames = []
	print(sys.argv)
	for i in range(1,len(sys.argv)):
		filenames.append(sys.argv[i])
	saveToCsv(filenames)


if __name__ == '__main__':
   main()

