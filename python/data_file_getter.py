import sys
import json
import numpy as np
import csvToJson
#python testscoring2.py /Users/russelldodd/Documents/freespeed/data/04\,10\,18/94/94THoF\ 7\ seat\ 20180410\ 0451pm.csv  23,33 strokes,strokes 24,6 0.1
import matplotlib.pyplot as plt
import parse_intervals as p_i

import os
from os.path import isfile
import watts_viewer as w_v


def getBiggestFiles():
	data_path = "/Users/cmadden/Documents/russell/Spring 2018"
	cur_path = os.getcwd()
	os.chdir(data_path)
	files = []
	for workout in os.listdir():
		if(not isfile(workout)):
			# print("workout", workout)
			cur_csvs = []
			os.chdir(workout)
			for boat in os.listdir():
				if(not isfile(boat)):
					# print("boat", boat)
					os.chdir(boat)
					for file in os.listdir():
						# print("file", file)
						if file.endswith(".csv"):
							# print("ends with csv", file)
							cur_csvs.append([os.path.abspath(file), os.path.getsize(file)])
					os.chdir("..")
			os.chdir("..")
			if(len(cur_csvs) > 0):
				files.append(max(cur_csvs, key=lambda item: item[1])[0])
	os.chdir(cur_path)
	return files

def getVariances(files):
	variances = []
	for file in files:
		to_format_data = p_i.GetIntervals()
		data = csvToJson.parseCsv(file)
		to_format_data.reformatArray(data)
		data["data"][13] = to_format_data.parseColumn(data["data"][13], lambda x: int(float(x)), int)
		data["data"][9] = to_format_data.parseColumn(data["data"][9], lambda x: int(float(x)), int)
		data["data"][1] = to_format_data.parseColumn(data["data"][1], lambda x: float(x), float)
		data["data"][3] = to_format_data.parseElapsedTime(data["data"][3])
		variances.append([file,np.var(data["data"][13])])

	return sorted(variances, key=lambda item: item[1], reverse=True)
files = getBiggestFiles()
# print(("\n").join(files))
# variances = getVariances(files)[:4]
viewer = w_v.WattsViewer()
for file in files:
	print(file)
	viewer.view(file)


