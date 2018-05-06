var results2 = {
    total: 0,
    bad: 0
  };

var sampleData1 = [{"power":10,"speedGPS":10,"slip":2,"wash":10,"strokeRate":22,"catch":-40,"finish":30,"maxForceAngle":9,"forceMax":100,"forceAvg":50,"work":500,"distancePerStrokeGPS":10.2,"heartRateBPM":100},
{"power":10,"speedGPS":10,"slip":2,"wash":10,"strokeRate":22,"catch":-40,"finish":30,"maxForceAngle":9,"forceMax":100,"forceAvg":50,"work":500,"distancePerStrokeGPS":10.2,"heartRateBPM":100}];
var sampleData2 = [{"power":10,"speedGPS":10,"slip":2,"wash":10,"strokeRate":22,"catch":-40,"finish":30,"maxForceAngle":9,"forceMax":100,"forceAvg":50,"work":500,"distancePerStrokeGPS":10.2,"heartRateBPM":100}];
var sampleData3 = [];
function testCleanData(){
  global_data = [{elapsedTime: "00:00:00.5", splitGPS: "00:01:30.5"},
  {elapsedTime: "00:00:02.5", splitGPS: "00:01:33.5"},
  {elapsedTime: "00:00:05.5", splitGPS: "00:01:30.5"}];
  cleanData();
  return JSON.stringify(global_data);
}

function testUpdateAverages(sampleData){
  global_raw_data = sampleData;
  updateAverages();
  return JSON.stringify(averages);
}

function test2(result, expected) {
  results2.total++;
  if (result !== expected) {
    results2.bad++;
    console.log("Expected " + expected +
      ", but was " + result);
  }
}

$( document ).ready(function() {
  var result = '[{"elapsedTime":"1900-01-01T05:00:00.500Z","splitGPS":"1900-01-01T05:01:30.500Z"},{"elapsedTime":"1900-01-01T05:00:02.500Z","splitGPS":"1900-01-01T05:01:33.500Z"},{"elapsedTime":"1900-01-01T05:00:05.500Z","splitGPS":"1900-01-01T05:01:30.500Z"}]';
  test2(testCleanData(), result);
  test2(testUpdateAverages(sampleData1), "[10,10,2,10,22,-40,30,9,100,50,500,10.2,100]");
  for (var i = 0; i < toggle_vals.length; i++){
  	averages[i] = 0;
  }
  test2(testUpdateAverages(sampleData2), "[10,10,2,10,22,-40,30,9,100,50,500,10.2,100]");
  for (var i = 0; i < toggle_vals.length; i++){
  	averages[i] = 0;
  }
  test2(testUpdateAverages(sampleData3), "[0,0,0,0,0,0,0,0,0,0,0,0,0]");

console.log("Of " + results2.total + " tests, " +
    results2.bad + " failed, " +
    (results2.total - results2.bad) + " passed.");
});


