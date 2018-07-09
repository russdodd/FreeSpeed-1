import json as JSON
import numpy as np
import csvToJson
# import sys
import matplotlib.pyplot as plt
# import scipy.fftpack
from scipy import signal
from peakutils import indexes
# import scipy.signal


numPieces = 3
obsIdxs = [13,8]
boat = "94"
foldername = "04,11,18"
filename = "94THoF 2 seat 20180411 0714am.csv"
filename2 = "94THoF 2 seat 20180331 1137am.csv"
path1 = "../" + "data/" + foldername + "/" + boat + "/" + filename
path2 = "../" + "data/" + foldername + "/" + boat + "/" + filename2


# datetime_object = time.strptime('Jun 1 2005  1:33', '%b %d %Y %I:%M')
# datetime_object2 = time.strptime('Jun 1 2005  1:00PM', '%b %d %Y %I:%M%p')
# x = datetime_object
# print(datetime.timedelta(hours=x.tm_hour,minutes=x.tm_min,seconds=x.tm_sec).total_seconds())
# z=dt.timedelta(minutes=1.5)
# time.strptime('1:00:52', '%H:%M:%S');
# %I:%M

def getStep(isRise, data, threshold=0.4):
	# isRise *= -1
	# print("len data",len(data))
	dary = isRise*np.hstack(([data[0]/2]*5,data,[data[-1]/2]*5))
	# N = 3
	# f = np.array([1]*N)/float(N) #smoothing
	# step1 = np.hstack((dary,np.array([0]*(N-1))))#smoothing

	# smoothed = np.convolve(f, step1, mode='valid')#smoothing
	kernel = [1, 0, -1]
	# dY1 = isRise*(data - (np.hstack((data[1:],[data[-1]]))))
	dY1 = np.convolve(dary, kernel, 'valid')
	# print("len dy1",len(dY1))
	# print("len dy1 trimmed",len(dY1[4: -4]))


	# dY1 = smoothed-dary
	dY1Peaks = dY1[:]
	dY1Peaks[dY1Peaks < 0] = 0
	peak_indexes = indexes(dY1Peaks, thres=threshold, min_dist=2) - 4
	peak_indexes[peak_indexes < 0] = 0
	peak_indexes[peak_indexes > (len(data)-1)] -=1 
	plt.plot(data)
	plt.plot(dY1[4: -4],'-bD', markevery=indexes.tolist())
	plt.show()
	return peak_indexes #brings points inwards

def stringToSecs(timeStr):
	secDec = int(timeStr[-1])
	hours = int(timeStr[:2])
	mins = int(timeStr[3:5])
	secs = int(timeStr[6:8])
	timeInSecs = secDec*0.1 + secs + mins*60 * hours*60*60
	return timeInSecs

# data = csvToJson.parseCsv(path)
# observations = np.array(data['data'])
# filteredObs = observations[:,obsIdxs]
def parseFile(file):
	data = csvToJson.parseCsv(file)
	obs = np.array(data['data'])
	cleanData = []
	for i in range(len(obs)):
		row = obs[i,obsIdxs]

		#null in obsIdxs or in time index (seperated as time is always included by default)
		if "---" in row or "---" in obs[i][3]:
			continue
		else:
			cleanData.append([stringToSecs(obs[i][3])] + [float(elem) for elem in row])
	return np.array(cleanData)


def filterData(data):
	Wn = 0.2
	N = 4
	b, a = signal.butter(N, Wn, 'low')
	# b, a = signal.butter(N, [0.01, 0.05], 'band')
	output_signal = signal.filtfilt(b, a, data)
	# plt.subplot(211)
	# plt.plot(output_signal)
	# plt.subplot(212)
	# plt.plot(data)
	# plt.show()
	return output_signal
def main():
	# print(len(filterData(power1)))
	# print(len(power1))

	data1 = parseFile(path1)
	data2 = parseFile(path1)


	power1 = data1[:,1]
	filtPower1 = filterData(power1)
	deltas = filtPower1 - (np.hstack((filtPower1[1:],[filtPower1[-1]])))
	rises = getStep(1, filtPower1)
	falls = getStep(-1, filtPower1)
	steps = np.hstack((rises,falls))
	steps = np.sort(steps)
	steps[steps >= len(filtPower1)] = len(filtPower1) - 1
	# print(steps)
	# print(steps.tolist())
	print(len(filtPower1))
	plt.subplot(211)
	plt.plot(power1,'-bD', markevery=steps.tolist())

	# plt.subplot(211)
	# plt.plot(power1)
	plt.subplot(212)
	plt.plot(filtPower1)
	plt.plot(deltas*5)
	# plt.show()

if __name__ == '__main__':
   main()




# power1 = np.hstack(([0]*3,data1[:,1],[0]*3))
# N=3
# # print(power1)
# # dary = power[:]
# #dary -= np.average(dary)

# # step = np.hstack((1*np.ones(len(dary)), -1*np.ones(len(dary))))

# # f = np.array([.242, .399, .242])
# f = np.array([1]*N)/float(N)
# step1 = np.hstack((power1,np.array([0]*(N-1))))

# power_step1 = np.convolve(f, step1, mode='valid')
# print(len(power_step1))
# print(len(power1))

# get the peak of the convolution, its index

#step_indexes = (-1*power_step1).argsort()[-1*numPieces:][::-1]  # yes, cleaner than np.where(dary_step == dary_step.max())[0][0]
#step_indexes = np.sort(step_indexes)
# plots
#print(len(dary_step-dary))
# plt.plot([np.average(power)]*150)
#print(power1[step_indx-5:step_indx+5])
#print(power1[step_indx])
#print(step_indexes)
#plt.plot(power1 - np.average(power1))
#plt.plot(-1*(power_step1))#, markevery=step_indexes)
# plt.show()
# **************************************************

# power1 = data1[:,1]
# numpieces = 3
# #print(power1)
# # dary = power1[:]
# dary = -1*power1[:]
#dary -= np.average(dary)
# kernel = [1, 0, -1]

# dY1 = np.convolve(dary, kernel, 'valid')
# #print(len(dY1))
# dY1Peaks = dY1[:]
# print(dY1)
# dY1Peaks[dY1Peaks < 0] = 0
# print(dY1Peaks)
# # sigPeaks = signal.find_peaks_cwt(dY1Peaks, np.arange(1,10))
# # print(sigPeaks)
# # peakPoints = dY1[sigPeaks]
# # print(peakPoints)
# # maxArgs = peakPoints.argsort()[-1*numpieces:][::-1]
# # print(maxArgs)
# # maxNPeaks = sigPeaks[maxArgs] + 1
# # print(maxNPeaks)
# indexes = peakutils.indexes(dY1Peaks, thres=0.5, min_dist=20)
# plt.plot(np.hstack((dY1,[0]*(len(kernel)-1))),'-gD', markevery=maxNPeaks.tolist())
# indexes = getStep(isRise, data):
# plt.plot(dY1,'-gD', markevery=indexes.tolist())
#plt.plot(-1*power1,'-gD', markevery=indexes.tolist())
#print(maxes)

# dY = np.convolve(dY1, kernel, 'valid') 
# print(len(dY))
# #Checking for sign-flipping
# S = np.sign(dY)
# ddS = np.convolve(S, kernel, 'valid')

# #These candidates are basically all negative slope positions
# #Add one since using 'valid' shrinks the arrays
# candidates = np.where(dY < 0)[0] + (len(kernel) - 1)
# print(candidates)
# #Here they are filtered on actually being the final such position in a run of
# #negative slopes
# peaks = sorted(set(candidates).intersection(np.where(ddS == 2)[0] + 1))

# #plt.plot(dary)

# #If you need a simple filter on peak size you could use:
# alpha = -0.0025
# peaks = np.array(peaks)[dY1[peaks] < alpha]

# plt.scatter(peaks, dY1[peaks], marker='x', color='g', s=40)
# print(peaks)
# # f = np.array([.242, .399, .242])
# f = np.array([1]*N)/float(N)
# step1 = np.hstack((power1,np.array([0]*(N-1))))

# power_step1 = np.convolve(f, step1, mode='valid')
# print(len(power_step1))
# print(len(power1))

# # get the peak of the convolution, its index

# step_indexes = (-1*power_step1).argsort()[-1*numPieces:][::-1]  # yes, cleaner than np.where(dary_step == dary_step.max())[0][0]
# step_indexes = np.sort(step_indexes)
# # plots
# #print(len(dary_step-dary))
# # plt.plot([np.average(power)]*150)
# #print(power1[step_indx-5:step_indx+5])
# #print(power1[step_indx])
# print(step_indexes)
# plt.plot(power1 - np.average(power1))
# plt.plot(-1*(power_step1-power1), markevery=step_indexes)
# plt.show()





	
