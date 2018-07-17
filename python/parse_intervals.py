#python3 parse_intervals.py <filepath> <piece lengths> <piece length type> <count of pieces> <threshold of piece accuracy>

import sys
import json
import numpy as np
import csvToJson #file I made
import matplotlib.pyplot as plt
import interval_scheduling as intshdl
from data_convolve import getStep, filterData
from itertools import combinations
from json import loads,dumps

class GetIntervals(object):

	#calculates the average watts and variance for each candidate and then returns these
	def calcScoresWithCandidates(self, candidates, endIdx, gap, intervalData, powerData):
		scores = [] # array of [aveWatts, variance] pairs
		for candidate in candidates:
			scores.append([np.average(powerData[candidate:endIdx]), np.var(powerData[candidate:endIdx])])
		if len(scores) == 0:
			return np.array([[-1.,-1.]])
		return np.array(scores)

	# converts the Elapsed time feature from string to seconds
	#returns the parsed column of data
	def parseElapsedTime(self, col):
		newCol = np.zeros(len(col))
		for i in range(len(newCol)):
			newCol[i] = csvToJson.elapsedTimeToSec(col[i])
		return newCol[:]

	# parses the column of data into the parse type by appying the lamba function
	def parseColumn(self, col, lam, parseType):
		idxs = np.where(col == "---")[0]
		for i in idxs:
			if ((i-1) < 0) or ((i+1) == len(col)) or (col[i-1] == "---") or (col[i+1] == "---"):
				col[i] = "0"
			else:
				col[i] = str((parseType(col[i-1]) + parseType(col[i+1]))/2)
		vfunc = np.vectorize(lam)
		col = vfunc(col)
		return col[:]

	# given an end point finds the start point from the candidate steps that are within 
	# threshold distance from the expected start point
	#thres is percent distance from expected start
	def getFrontrises(self, thres, endVal, gap, intervalData, rises):
		startThres = endVal - gap - gap*thres
		endThres = endVal - gap + gap*thres
		closeRises = []
		for rise in rises:
			if intervalData[rise] >= startThres and intervalData[rise] <= endThres:
				closeRises.append(rise)
			elif intervalData[rise] > endThres:
				break
		return np.array(closeRises)

	# turns the column of data into a numpy array
	def reformatArray(self, data):
		dataRows = np.swapaxes(np.array(data["data"]),0,1).tolist()
		data["data"] = [np.zeros(len(dataRows[0])) for i in range(len(dataRows))]
		for i in range(len(data["data"])):
			data["data"][i] = np.array(dataRows[i][:])

	# links a candidate end point of a piece to a candidate start point that has the best score
	# produces a list of candidate piece intervals and a list of each respective score
	def getIntervals(self, falls, scores, candidates):
		bestpairs = []
		scoresFilt = []
		for fall, scoreList, candidateGroup in zip(falls, scores, candidates):
			if len(candidateGroup) == 0 or scoreList[0][0] < 0:
				continue
			scoreCopy = np.empty_like(scoreList)
			scoreCopy[:] = scoreList
			scoreCopy[:,0] /= np.max(scoreCopy[:,0])
			scoreCopy[:,1] /= np.max(scoreCopy[:,1])
			scoresScalarLst = 1 - scoreCopy[:,1] + scoreCopy[:,0]
			maxScore = np.max(scoresScalarLst)
			argMax = np.argmax(scoresScalarLst)
			scoresFilt.append(scoreList[argMax])
			bestpairs.append([candidateGroup[argMax], fall])
		return np.array(bestpairs), scoresFilt


	# further processes the score and creates and interval that has the type and score
	def createScoreGroupingCandidates(self, scores, groupings, idx):
		comboScores = self.getCombinedScores(scores)
		intervals = []
		for i in range(len(groupings)):
			intervals.append([comboScores[i], idx, groupings[i][0], groupings[i][1]])
		return intervals

	# combines variance and average watts to create a single weighted score from 0 to 1
	def getCombinedScores(self, scores):
		scoreCopy = np.empty_like(scores)
		scoreCopy[:] = scores
		scoreCopy[:,0] = ((scoreCopy[:,0] + 0.0000001) - np.min(scoreCopy[:,0]))/ (np.max(scoreCopy[:,0]) - np.min(scoreCopy[:,0]))
		scoreCopy[:,1] = ((scoreCopy[:,1] + 0.0000001) - np.min(scoreCopy[:,1]))/ (np.max(scoreCopy[:,1]) - np.min(scoreCopy[:,1]))
		p = 0.2
		q = 1 - p
		return (1 - scoreCopy[:,1])*p + scoreCopy[:,0]*q

	# produces candidate start points given the candidate end points and then filters down to the best candidates
	# 
	def getSortedOrderings(self, falls, rises, intervalIdx, gap, data, filtPower,threshold, topN, idx):
		candidates = []
		#get candidates for each fall for one piece size
		for fall in falls:
			candidates.append(self.getFrontrises(threshold, data["data"][intervalIdx][fall], gap, data["data"][intervalIdx], rises).tolist())
		# shift the points closer together
		for i in range(len(falls)):
			falls[i] -= 1
		for i in range(len(candidates)):
			for j in range(len(candidates[i])):
				candidates[i][j] += 1 
		scores = []
		for candidateGroup, fall in zip(candidates, falls):
			scores.append(self.calcScoresWithCandidates(candidateGroup, fall, gap, data["data"][intervalIdx], filtPower))
		scores = np.array(scores)
		groupings, scores = self.getIntervals(falls, scores, candidates)

		#orderings = self.chooseN(scores, groupings, topN, idx)
		orderings = self.createScoreGroupingCandidates(scores, groupings, idx)
		#sorted_orderings = sorted(orderings, key=lambda x: x[0], reverse=True)
		return orderings, groupings #sorted_orderings, groupings

	#combines everything to return the best weighted schedule of pieces given the input data
	def combineProduceIntervals(self, data, topN, gap, intervalIdx, threshold):
		self.reformatArray(data)
		data["data"][13] = self.parseColumn(data["data"][13], lambda x: int(float(x)), int)
		data["data"][9] = self.parseColumn(data["data"][9], lambda x: int(float(x)), int)
		data["data"][1] = self.parseColumn(data["data"][1], lambda x: float(x), float)
		data["data"][3] = self.parseElapsedTime(data["data"][3])
		#note to self, I think there are cases where I am zeroing a "---" for power and it ruins the variance
		#also look into an alternative for variance that allows for one or two outliers without skewing the result?

		power = data["data"][13]
		filtPower = filterData(power)
		rises = getStep(1, filtPower, 0.15)
		falls = getStep(-1, filtPower, 0.2) #- 1
		steps = np.hstack((rises,falls))
		steps = np.sort(steps)
		steps[steps >= len(power)] = len(power) - 1
		groupings = []
		for i in range(len(intervalIdx)):
			groupings.append([])
		sorted_orderings = []
		for i in range(len(groupings)):
			cur_sorted_orderings, cur_groupings = self.getSortedOrderings(falls, rises, intervalIdx[i], gap[i], data, filtPower,threshold, topN[i], i)
			groupings[i] = cur_groupings
			sorted_orderings += cur_sorted_orderings
		scheduler = intshdl.OptimalSchedule(sorted_orderings, topN)
		opt = scheduler.returnBestSchedule()
		groupsToUse = np.array(opt[1])
		intervals = []
		if len(groupsToUse) > 0:
			maxType = np.amax(groupsToUse[:,1])
			intervals = [groupsToUse[np.where(groupsToUse[:,1] == x)][:,[2,3]] for x in range(int(maxType) + 1)]
		if __name__ == "__main__":
			return data, intervals
		else:
			return intervals

	#for test
	# parses input arguments and initiates the process
	def returnIntervals(self):
		topN = [int(arg) for arg in sys.argv[4].split(",")]
		#print(topN)
		path = sys.argv[1]
		data = csvToJson.parseCsv(path)
		gap = sys.argv[2].split(",")
		intervalIdxs = {"strokes": 9, "distance": 1, "time": 3}
		intervalIdx = [intervalIdxs[arg] for arg in sys.argv[3].split(",")]
		for i in range(len(intervalIdx)):
			if intervalIdx[i] == 3:
				gap[i] = csvToJson.elapsedTimeToSec("00:" + gap[i] + ".0")
			else:
				gap[i] = int(gap[i])
		threshold = 0.1
		if len(sys.argv) == 6:
			threshold = float(sys.argv[5])
		return self.combineProduceIntervals(data, topN, gap, intervalIdx, threshold)

	# for production
	# same as above function but for use to be called by main node.js server
	def sendIntervals(self, data, topN, gap, intervalIdx, threshold="0.1"):
		topN = [int(arg) for arg in topN.split(",")]
		data = loads(data)
		gap = gap.split(",")
		intervalIdxs = {"strokes": 9, "distance": 1, "time": 3}
		intervalIdx = [intervalIdxs[arg] for arg in intervalIdx.split(",")]
		for i in range(len(intervalIdx)):
			if intervalIdx[i] == 3:
				gap[i] = csvToJson.elapsedTimeToSec("00:" + gap[i] + ".0")
			else:
				gap[i] = int(gap[i])
		threshold = float(threshold)
		return dumps(self.combineProduceIntervals(data, topN, gap, intervalIdx, threshold))



if __name__ == "__main__":
	# combine everything and graph result
	getInts = GetIntervals()
	data, ints = getInts.returnIntervals()
	intsFlat = []
	sizes = []
	for intLst in ints:
		intsFlat += intLst.flatten().astype(int).tolist()
		sizes.append(len(intLst))
	print("count ints", sizes)

	plt.plot(filterData(data["data"][13]),'-b', zorder=1)#ints.flatten().astype(int).tolist())
	if len(ints) > 0:
		rises = np.array(intsFlat)[::2]
		falls = np.array(intsFlat)[1::2]

		plt.scatter(rises,filterData(data["data"][13])[rises], color='g', marker='d', zorder=2)
		plt.scatter(falls,filterData(data["data"][13])[falls], color='r', marker='d', zorder=3)
	plt.show()






