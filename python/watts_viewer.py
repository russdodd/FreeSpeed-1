import parse_intervals as p_i
import csvToJson
import matplotlib.pyplot as plt
import sys

class WattsViewer():
	def view(self, file):
		format_data = p_i.GetIntervals()
		data = csvToJson.parseCsv(file)
		format_data.reformatArray(data)
		data["data"][13] = format_data.parseColumn(data["data"][13], lambda x: int(float(x)), int)
		data["data"][9] = format_data.parseColumn(data["data"][9], lambda x: int(float(x)), int)
		data["data"][1] = format_data.parseColumn(data["data"][1], lambda x: float(x), float)
		data["data"][3] = format_data.parseElapsedTime(data["data"][3])
		plt.plot(data["data"][13],'-b')#ints.flatten().astype(int).tolist())
		plt.show()

if __name__ == "__main__":
	path = r"{}".format(sys.argv[1])
	viewer = WattsViewer()
	viewer.view(path)