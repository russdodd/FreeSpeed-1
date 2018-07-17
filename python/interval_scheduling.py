import json
import numpy as np
import sys

class OptimalSchedule(object):
	def __init__(self, intervals, num_to_pick):
		print("num intervals",len(intervals))
		self.intervals = intervals
		self.num_type_to_pick = num_to_pick
	
	# print dynamic programming table
	def printSquare(self, sum_to_pick, OPT):
		for i in range(sum_to_pick):
			for j in range(len(self.intervals)):
				strToPrint = '{:>4}, '.format(str(round(OPT[j][i][0], 2)))
				sys.stdout.write(strToPrint)
			sys.stdout.write("\n")
		sys.stdout.write("\n")

	# computes the previous closest interval for each interval
	def computeP(self):
		#compute p
		p = []
		for i in range(len(self.intervals)):
			p.append(0)
		for i in range(1, len(self.intervals)):
			for j in reversed(range(0, i)):
				if self.intervals[j][3] <= self.intervals[i][2]: #finish less than or equal to start time
					p[i] = j
					break
		return p

	# the meat of the algorithm
	def scheduleOpt(self, p):
		# find opt
		sum_to_pick = 1
		for type_pick,pick in enumerate(self.num_type_to_pick):
			sum_to_pick += pick

		i = 1
		counter_to_pick = 1
		OPT = [[[0, []] for x in range(sum_to_pick)] for y in range(len(self.intervals))]
		for type_pick,pick in enumerate(self.num_type_to_pick):
			counter_to_pick += pick
			while i < counter_to_pick:
				for j in range(1, len(self.intervals)):
					# if it is the right type 
					# and
					#if including current val is greater then previous val
					#if T[prev(i)][k-1] + val(i) > T[i-1][k
					if self.intervals[j][1] == type_pick and OPT[p[j]][i-1][0] + self.intervals[j][0] > OPT[j-1][i][0]:
						val = OPT[p[j]][i-1][0] + self.intervals[j][0]
						OPT[j][i] = [val, OPT[p[j]][i-1][1] + [self.intervals[j]]]
					else:
						OPT[j][i] = OPT[j-1][i].copy()
				i+=1
		return OPT[len(self.intervals) - 1][sum_to_pick-1]

	# compute and return the best schedule
	def returnBestSchedule(self):
		self.intervals = [[0, 0, 0, 0]] + sorted(self.intervals, key=lambda x: x[3], reverse=False)
		p = self.computeP()
		ints = self.scheduleOpt(p)
		print("ints", ints)
		return ints

# for j in p:
# 	strToPrint = '{:>4}, '.format(str(round(sorted_weighted_ints[j][0],2)))
# 	sys.stdout.write(strToPrint)
# sys.stdout.write("\n")
# for j in sorted_weighted_ints:
# 	strToPrint = '{:>4}, '.format(str(round(j[0],2)))
# 	sys.stdout.write(strToPrint)
# sys.stdout.write("\n")
# for j in sorted_weighted_ints:
# 	strToPrint = '{:>4}, '.format(str(j[2]))
# 	sys.stdout.write(strToPrint)
# sys.stdout.write("\n")
# for j in sorted_weighted_ints:
# 	strToPrint = '{:>4}, '.format(str(j[3]))
# 	sys.stdout.write(strToPrint)
# sys.stdout.write("\n\n")



# printSquare()

# print("OPT", OPT[len(sorted_weighted_ints) - 1][sum_to_pick-1])




