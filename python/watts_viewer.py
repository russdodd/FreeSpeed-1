import parse_intervals as p_i
import csvToJson
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import sys
import math

class WattsViewer():
	def view(self, file, ind_type):
		format_data = p_i.GetIntervals()
		data = csvToJson.parseCsv(file)
		format_data.reformatArray(data)
		data["data"][13] = format_data.parseColumn(data["data"][13], lambda x: int(float(x)), int)
		data["data"][9] = format_data.parseColumn(data["data"][9], lambda x: int(float(x)), int)
		data["data"][8] = format_data.parseColumn(data["data"][8], lambda x: int(float(x)), int)
		data["data"][5] = format_data.parseColumn(data["data"][5], lambda x: float(x), float)
		data["data"][1] = format_data.parseColumn(data["data"][1], lambda x: float(x), float)
		data["data"][3] = format_data.parseElapsedTimePlot(data["data"][3])
		frac = math.floor(len(data["data"][1])*0.91)
		if ind_type == "time":
			plt.plot(data["data"][3], data["data"][13],'-b')#ints.flatten().astype(int).tolist())
			plt.fmt_xdata = mdates.DateFormatter("%H:%M:%S.%f")
			xax = plt.gca().get_xaxis()
			xax.set_major_formatter(mdates.DateFormatter("%M:%S"))
		elif ind_type == "distance":
			plt.plot(data["data"][1], data["data"][13],'-b')#ints.flatten().astype(int).tolist())
		elif ind_type == "strokes":
			plt.plot(data["data"][9], data["data"][13],'-b')#ints.flatten().astype(int).tolist())
		elif ind_type == "rate":
			plt.scatter(data["data"][8], data["data"][13])#ints.flatten().astype(int).tolist())
		elif ind_type == "speed":
			plt.plot(data["data"][3][:frac], (data["data"][5]/data["data"][13])[:frac])#ints.flatten().astype(int).tolist())
		plt.show()

if __name__ == "__main__":
	ind_type = sys.argv[2]
	path = r"{}".format(sys.argv[1])
	viewer = WattsViewer()
	viewer.view(path, ind_type)