import zerorpc
import sys
import json
import numpy as np
import csvToJson
# import matplotlib.pyplot as plt
# import sys
# import time
from testConvolve import getStep, filterData
from itertools import combinations
from json import loads,dumps

class GetIntervals(object):
	def calcScoresWithCandidates(self, candidates, endIdx, gap, intervalData, powerData):
		scores = [] # array of [aveWatts, variance] pairs
		for candidate in candidates:
			scores.append([np.average(powerData[candidate:endIdx]), np.var(powerData[candidate:endIdx])])
		if len(scores) == 0:
			return np.array([[-1.,-1.]])
		return np.array(scores)

	def parseElapsedTime(self, col):
		newCol = np.zeros(len(col))
		for i in range(len(newCol)):
			newCol[i] = csvToJson.elapsedTimeToSec(col[i])
		return newCol[:]

	def parseColumn(self, col, parseType):
		# print(col)
		# print(col[np.where(col == "---")])
		idxs = np.where(col == "---")[0]
		# print(np.where(col == "---"))
		# print(idxs)
		# print("first", idxs[0])
		for i in idxs:
			if ((i-1) < 0) or ((i+1) == len(col)) or (col[i-1] == "---") or (col[i+1] == "---"):
				col[i] = "0"
			else:
				col[i] = str((parseType(col[i-1]) + parseType(col[i+1]))/2)
		# col[np.where(col == "---")] = "0"
		# print(col)
		col = col.astype(parseType)
		return col[:]

	#thres is percent distance from expected start
	def getFrontrises(self, thres, endVal, gap, intervalData, rises):
		# print((thres, endVal, gap, intervalData, rises))
		startThres = endVal - gap - gap*thres
		endThres = endVal - gap + gap*thres
		closeRises = []
		for rise in rises:
			# print(rise,intervalData[rise], endThres)
			if intervalData[rise] >= startThres and intervalData[rise] <= endThres:
				closeRises.append(rise)
			elif intervalData[rise] > endThres:
				break
		return np.array(closeRises)


	def reformatArray(self, data):
		# newData = []
		dataRows = np.swapaxes(np.array(data["data"]),0,1).tolist()
		data["data"] = [np.zeros(len(dataRows[0])) for i in range(len(dataRows))]
		# print(data["data"])
		for i in range(len(data["data"])):
			data["data"][i] = np.array(dataRows[i][:])
		# data["data"]

	def getIntervals(self, falls, scores, candidates):
		bestpairs = []
		scoresFilt = []
		for fall, scoreList, candidateGroup in zip(falls, scores, candidates):
			if len(candidateGroup) == 0 or scoreList[0][0] < 0:
				continue
			scoreCopy = np.empty_like(scoreList)
			scoreCopy[:] = scoreList
			# print(scoreCopy)
			# print(scoreCopy[0][0])
			scoreCopy[:,0] /= np.max(scoreCopy[:,0])
			scoreCopy[:,1] /= np.max(scoreCopy[:,1])
			scoresScalarLst = 1 - scoreCopy[:,1] + scoreCopy[:,0]
			maxScore = np.max(scoresScalarLst)
			argMax = np.argmax(scoresScalarLst)
			scoresFilt.append(scoreList[argMax])
			bestpairs.append([candidateGroup[argMax], fall])
		return np.array(bestpairs), scoresFilt

	def getRankedScores(self, scores):
		scoreCopy = np.empty_like(scores)
		# print(scores)
		scoreCopy[:] = scores
		scoreCopy[:,0] /= np.max(scoreCopy[:,0])
		scoreCopy[:,1] /= np.max(scoreCopy[:,1])
		p = 0.5
		q = 1 - p
		scoresScalarLst = (1 - scoreCopy[:,1])*p + scoreCopy[:,0]*q
		order = np.flip(np.argsort(scoresScalarLst),0)
		print(order)
		print(scoresScalarLst[order])

	def getTopNScoresArgs(self, n, scores):
		scoreCopy = np.empty_like(scores)
		scoreCopy[:] = scores
		scoreCopy[:,0] /= np.max(scoreCopy[:,0])
		scoreCopy[:,1] /= np.max(scoreCopy[:,1])
		p = 0.5
		q = 1 - p
		scoresScalarLst = (1 - scoreCopy[:,1])*p + scoreCopy[:,0]*q
		order = np.flip(np.argsort(scoresScalarLst),0)
		return order[:n]

	def is_sorted(self, a):
	    for i in range(len(a)-1):
	         if a[i+1] < a[i]:
	               return False
	    return True

	#returns [score, [orderingArgs]]
	def chooseN(self, scores, groupings, n, idx):
		comboScores = self.getCombinedScores(scores)
		# print("len scores", range(len(comboScores)))
		# print("n", n)
		combs = combinations(range(len(comboScores)), n)
		intervals = []
		x = 0
		for comb in combs:
			# print("iter", x)
			# x+=1
			np_comb = np.array(comb)
			cur_intervals = groupings[np_comb]
			cur_intervals = np.array(cur_intervals).flatten()
			if self.is_sorted(cur_intervals):
				score = np.sum(comboScores[np_comb])/len(comboScores)
			else:
				score = 0.0
			intervals.append([score, [cur_intervals[0], cur_intervals[-1]], np_comb, idx])
		return intervals

	def getCombinedScores(self, scores):
		scoreCopy = np.empty_like(scores)
		# print(scores)
		scoreCopy[:] = scores
		scoreCopy[:,0] = ((scoreCopy[:,0] + 0.0000001) - np.min(scoreCopy[:,0]))/ (np.max(scoreCopy[:,0]) - np.min(scoreCopy[:,0]))
		scoreCopy[:,1] = ((scoreCopy[:,1] + 0.0000001) - np.min(scoreCopy[:,1]))/ (np.max(scoreCopy[:,1]) - np.min(scoreCopy[:,1]))
		p = 0.2
		q = 1 - p
		return (1 - scoreCopy[:,1])*p + scoreCopy[:,0]*q

	def getSortedOrderings(self, falls, rises, intervalIdx, gap, data, filtPower,threshold, topN, idx):
		candidates = []
		#get candidates for each fall for one piece size
		# fallscopy = 
		for fall in falls:
			candidates.append(self.getFrontrises(threshold, data["data"][intervalIdx][fall], gap, data["data"][intervalIdx], rises).tolist())
		# print("candidates",len(candidates),candidates)
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


		
		# print("scores", len(scores),scores)
		groupings, scores = self.getIntervals(falls, scores, candidates)

		orderings = self.chooseN(scores, groupings, topN, idx)
		sorted_orderings = sorted(orderings, key=lambda x: x[0], reverse=True)
		return sorted_orderings, groupings

	def computeP(self, sorted_on_finish):
		# p = [0] * (len(sorted_on_finish) + 1)
		p = []
		for i in range((len(sorted_on_finish) + 1)):
			p.append(0)
		for i in range(len(sorted_on_finish)):
			for j in reversed(range(0, i-1)):
				if(sorted_on_finish[j][1][1] < sorted_on_finish[i][1][0]): #finish less than start time
					p[i] = j
					break
		return p


	def getBestSchedule(self, orderings):
		# sorted smallest finish index to largest
		sorted_on_finish = sorted(orderings, key=lambda x: x[1][1], reverse=False)
		sorted_on_finish = [[0,[0,0],[],-1]] + sorted_on_finish
		p = self.computeP(sorted_on_finish)
		OPT = []
		for i in range(len(sorted_on_finish)):
			OPT.append([0, [], []])
		for j in range(1, len(sorted_on_finish)):
			if sorted_on_finish[j][0] + OPT[p[j]][0] > OPT[j-1][0] and sorted_on_finish[j][3] not in OPT[p[j]][2]:
				OPT[j] = [OPT[p[j]][0] + sorted_on_finish[j][0],OPT[p[j]][1] + [j], OPT[p[j]][2] + [sorted_on_finish[j][3]]]
			else:
				OPT[j] = OPT[j-1]
		return sorted_on_finish, OPT[len(sorted_on_finish) - 1]

	def combineProduceIntervals(self, data, topN, gap, intervalIdx, threshold="0.1"):
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
		self.reformatArray(data)
		data["data"][13] = self.parseColumn(data["data"][13], int)
		data["data"][9] = self.parseColumn(data["data"][9], int)
		data["data"][1] = self.parseColumn(data["data"][1], float)
		data["data"][3] = self.parseElapsedTime(data["data"][3])
		# start_time = time.time()

		#note to self, I think there are cases where I am zeroing a "---" for power and it ruins the variance
		#also look into an alternative for variance that allows for one or two out liers without skewing the result?


		power = data["data"][13]
		# sys.stdout.write(json.dumps(power.tolist()))
		# sys.stdout.flush()
		# return;
		filtPower = filterData(power)
		rises = getStep(1, filtPower, 0.15)
		falls = getStep(-1, filtPower, 0.2) #- 1
		steps = np.hstack((rises,falls))
		steps = np.sort(steps)
		steps[steps >= len(power)] = len(power) - 1

		# print(len(data["data"][9]))
		# print(len(data["data"][1]))
		# print(len(data["data"][3]))
		# print(len(data["data"][13]))
		# print(len(filtPower))

		# print("rises",rises)
		# print("falls",len(falls),falls)

		groupings = []
		for i in range(len(intervalIdx)):
			groupings.append([])
		# [[]] * len(intervalIdx)
		sorted_orderings = []
		for i in range(len(groupings)):
			cur_sorted_orderings, cur_groupings = self.getSortedOrderings(falls, rises, intervalIdx[i], gap[i], data, filtPower,threshold, topN[i], i)
			groupings[i] = cur_groupings
			# print("sorted_orderings", i, cur_sorted_orderings)
			sorted_orderings += cur_sorted_orderings

		groupsToUse = []
		sorted_on_finish, opt = self.getBestSchedule(sorted_orderings)
		# print(opt)
		# print(sorted_on_finish[opt[1][0]])
		# print(sorted_on_finish[opt[1][1]])
		# print()
		for i in range(len(opt[1])):
			interval = sorted_on_finish[opt[1][i]]
			grouping_idx = interval[3]
			groupsToUse += groupings[grouping_idx][interval[2]].tolist()

		# print("flattened groupings",np.array(groupsToUse).flatten())

		# print("--- %s seconds ---" % (time.time() - start_time))
		# plt.subplot(211)

		# plt.plot(data["data"][13],'-bD', markevery=np.array(groupsToUse).flatten().tolist())

		# plt.show()
		return dumps(groupsToUse)


s = zerorpc.Server(GetIntervals())
s.bind("tcp://0.0.0.0:4242")
s.run()







