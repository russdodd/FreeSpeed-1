import json as JSON
import numpy as np
import csvToJson
import matplotlib.pyplot as plt
from scipy import signal
from peakutils import indexes

# Returns indexes that represent steps in the data
# uses a peak finding library to find the peaks after applying the convolution
def getStep(isRise, data, threshold=0.4):
	dary = isRise*np.hstack(([data[0]/2]*5,data,[data[-1]/2]*5))
	kernel = [1, 0, -1]
	dY1 = np.convolve(dary, kernel, 'valid')
	dY1Peaks = dY1[:]
	dY1Peaks[dY1Peaks < 0] = 0
	peak_indexes = indexes(dY1Peaks, thres=threshold, min_dist=2) - 4
	peak_indexes[peak_indexes < 0] = 0
	peak_indexes[peak_indexes > (len(data)-1)] -=1 
	# plt.plot(data)
	# plt.plot(dY1[4: -4],'-bD', markevery=peak_indexes.tolist())
	# plt.show()
	return peak_indexes #brings points inwards

def stringToSecs(timeStr):
	secDec = int(timeStr[-1])
	hours = int(timeStr[:2])
	mins = int(timeStr[3:5])
	secs = int(timeStr[6:8])
	timeInSecs = secDec*0.1 + secs + mins*60 * hours*60*60
	return timeInSecs

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
	print(len(filtPower1))
	plt.subplot(211)
	plt.plot(power1,'-bD', markevery=steps.tolist())

	plt.subplot(212)
	plt.plot(filtPower1)
	plt.plot(deltas*5)

if __name__ == '__main__':
   main()




	
