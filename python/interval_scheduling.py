import json
import numpy as np
import sys
# import matplotlib as plt
# min start = 0
#max end = 100
# [weight(0-1), type, start, end]
# num_to_pick = 3

# weighted_ints = [
# 	[0.8, 1, 0, 10],
# 	[0.7, 2, 0, 10],

# 	[0.7, 1, 11, 20],
# 	[0.9, 2, 11, 20],

# 	[0.8, 1, 30, 40],
# 	[0.5, 2, 30, 40],

# 	[0.99, 1, 0, 12],
# 	[0.5, 1, 30, 40],
# 	[1, 1, 40, 50]
# 	]

# weighted_ints = [
# 	[0.8, 1, 0, 10],
# 	[0.7, 1, 0, 10],

# 	[0.7, 1, 11, 20],
# 	[0.9, 1, 11, 20],

# 	[0.8, 1, 30, 40],
# 	[0.5, 1, 30, 40],

# 	[0.99, 1, 0, 12],
# 	[1, 1, 30, 40],
# 	[1, 1, 40, 50]
# 	]
# # sorted on finish
# sorted_weighted_ints = [[0, 0, 0, 0]] + sorted(weighted_ints, key=lambda x: x[3], reverse=False)

# print(sorted_weighted_ints)

# #compute p
# p = []
# for i in range(len(sorted_weighted_ints)):
# 	p.append(0)
# for i in range(1, len(sorted_weighted_ints)):
# 	for j in reversed(range(0, i)):
# 		if sorted_weighted_ints[j][3] <= sorted_weighted_ints[i][2]: #finish less than or equal to start time
# 			p[i] = j
# 			break

# # find opt

# OPT = [[[0, []] for x in range(num_to_pick + 1)] for y in range(len(sorted_weighted_ints))]

# for i in range(1, num_to_pick + 1):
# 	for j in range(1, len(sorted_weighted_ints)):
# 		#if including current val is greater then previous val
# 		#if T[prev(i)][k-1] + val(i) > T[i-1][k]
# 		if OPT[p[j]][i-1][0] + sorted_weighted_ints[j][0] > OPT[j-1][i][0]:
# 			val = OPT[p[j]][i-1][0] + sorted_weighted_ints[j][0]
# 			OPT[j][i] = [val, OPT[p[j]][i-1][1] + [sorted_weighted_ints[j]]]
# 		else:
# 			OPT[j][i] = OPT[j-1][i].copy()
# print(OPT[len(sorted_weighted_ints) - 1][num_to_pick])

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

# def printSquare():
# 	for i in range(num_to_pick + 1):
# 		for j in range(len(sorted_weighted_ints)):
# 			strToPrint = '{:>4}, '.format(str(round(OPT[j][i][0], 2)))
# 			sys.stdout.write(strToPrint)
# 		sys.stdout.write("\n")

# printSquare()

num_type_to_pick = [[1,1],[2,2],[2,3]]

weighted_ints = [
	[0.8, 1, 0, 10],
	[0.7, 2, 0, 10],

	[0.7, 1, 11, 20],
	[0.9, 2, 11, 20],

	[0.8, 1, 30, 40],
	[0.5, 2, 30, 40],

	[0.99, 1, 0, 12],
	[0.5, 1, 30, 40],
	[1, 1, 40, 50]
	]

weighted_ints = [
	[0.8, 1, 0, 10],
	[0.7, 1, 0, 10],

	[0.7, 1, 11, 20],
	[0.9, 1, 11, 20],

	[0.8, 1, 30, 40],
	[0.99, 2, 20, 30],
	[0.5, 2, 30, 40],

	[1, 1, 40, 50],
	[1, 1, 50, 60]
	]

weighted_ints = [
	[0.8, 1, 0, 10],
	[0.7, 1, 0, 10],

	[0.7, 1, 11, 20],
	[0.9, 1, 11, 20],

	[0.8, 1, 30, 40],
	[0.99, 3, 20, 30],
	[0.99, 2, 20, 30],
	[0.5, 2, 30, 40],

	[1, 1, 40, 50],
	[0.9, 3, 40, 50],
	[1, 1, 50, 60],
	[0.8, 3, 50, 60]
	]
# sorted on finish
sorted_weighted_ints = [[0, 0, 0, 0]] + sorted(weighted_ints, key=lambda x: x[3], reverse=False)

print(sorted_weighted_ints)

def printSquare():
	for i in range(sum_to_pick):
		for j in range(len(sorted_weighted_ints)):
			strToPrint = '{:>4}, '.format(str(round(OPT[j][i][0], 2)))
			sys.stdout.write(strToPrint)
		sys.stdout.write("\n")
	sys.stdout.write("\n")


#compute p
p = []
for i in range(len(sorted_weighted_ints)):
	p.append(0)
for i in range(1, len(sorted_weighted_ints)):
	for j in reversed(range(0, i)):
		if sorted_weighted_ints[j][3] <= sorted_weighted_ints[i][2]: #finish less than or equal to start time
			p[i] = j
			break

# find opt
sum_to_pick = 1
for pick,type_pick in num_type_to_pick:
	sum_to_pick += pick

i = 1
counter_to_pick = 1
OPT = [[[0, []] for x in range(sum_to_pick)] for y in range(len(sorted_weighted_ints))]
for pick,type_pick in num_type_to_pick:
	counter_to_pick += pick
	print("counter to pick", counter_to_pick)
	while i < counter_to_pick:
		for j in range(1, len(sorted_weighted_ints)):
			# if it is the right type 
			# and
			#if including current val is greater then previous val
			#if T[prev(i)][k-1] + val(i) > T[i-1][k
			if sorted_weighted_ints[j][1] == type_pick and OPT[p[j]][i-1][0] + sorted_weighted_ints[j][0] > OPT[j-1][i][0]:
				val = OPT[p[j]][i-1][0] + sorted_weighted_ints[j][0]
				OPT[j][i] = [val, OPT[p[j]][i-1][1] + [sorted_weighted_ints[j]]]
			else:
				OPT[j][i] = OPT[j-1][i].copy()
		i+=1
	printSquare()


for j in p:
	strToPrint = '{:>4}, '.format(str(round(sorted_weighted_ints[j][0],2)))
	sys.stdout.write(strToPrint)
sys.stdout.write("\n")
for j in sorted_weighted_ints:
	strToPrint = '{:>4}, '.format(str(round(j[0],2)))
	sys.stdout.write(strToPrint)
sys.stdout.write("\n")
for j in sorted_weighted_ints:
	strToPrint = '{:>4}, '.format(str(j[2]))
	sys.stdout.write(strToPrint)
sys.stdout.write("\n")
for j in sorted_weighted_ints:
	strToPrint = '{:>4}, '.format(str(j[3]))
	sys.stdout.write(strToPrint)
sys.stdout.write("\n\n")



printSquare()

print("OPT", OPT[len(sorted_weighted_ints) - 1][sum_to_pick-1])




