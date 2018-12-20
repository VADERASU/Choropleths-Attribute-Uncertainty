var Kmeans = {
        numberOfIterations: 1000,
        Init: function(K, data) {
            Kmeans.K = K;
            Kmeans.data = data;
            Kmeans.instanceLength = data[0].length
            Kmeans.MaxandMin = FindMaxAndMin();
        },
        setcenters: function(centers) {
            Kmeans.center = $.extend(true, [], centers);
        },
        Scluster: function(numberRun) {
            let result = null;
            for (let runnum = 0; runnum < numberRun; runnum++) {
                let thisdistortion = 0;
                let centers = [];
                for (let i = 0; i < Kmeans.K; i++) {
                    centers[i] = randomcentroids()
                }

                for (let iterationCount = 0, centroidsChanged = true, randomCentroids = true;
                    (randomCentroids || centroidsChanged) && iterationCount < Kmeans.numberOfIterations; iterationCount++) {
                    //assign
                    let assignment = assign(Kmeans.data, centers)
                    //center
                    let sumPosition = [],
                        countPosition = [];
                    for (let i = 0; i < Kmeans.K; i++) {
                        sumPosition.push([])
                        countPosition.push(0)
                        for (let j = 0; j < Kmeans.instanceLength; j++) {
                            sumPosition[i].push(0)
                        }
                    }
                    for (let i = 0; i < Kmeans.data.length; i++) {
                        for (let j = 0; j < Kmeans.instanceLength; j++) {
                            sumPosition[assignment[i]][j] += Kmeans.data[i][j];
                        }
                        countPosition[assignment[i]]++;
                    }
                    centroidsChanged = false;
                    randomCentroids = false;

                    for (let i = 0; i < Kmeans.K; i++) {
                        if (countPosition[i] > 0) {
                            let tmp = []
                            for (let j = 0; j < Kmeans.instanceLength; j++) {
                                tmp.push(sumPosition[i][j] / countPosition[i])
                            }
                            // Instance newCentroid = new DenseInstance(tmp);
                            if (distanceto(tmp, centers[i]) > 0.0001) {
                                centroidsChanged = true;
                                centers[i] = tmp;
                            }
                        } else {
                            randomCentroids = true;
                            centers[i] = randomcentroids()
                        }
                    }
                }

                let clusters = assign(Kmeans.data, centers)
                let clusternormal = new Array(Kmeans.K);
                for (let i = 0; i < clusters.length; i++) {
                    if (clusternormal[clusters[i]] == undefined) {
                        clusternormal[clusters[i]] = []
                    }
                    clusternormal[clusters[i]].push(i)
                }
                for (let i = 0; i < clusternormal.length; i++) {
                    
                    if (clusternormal[clusters[i]] == undefined) {
                        clusternormal[clusters[i]] = []
                    }
                }
                for (let i = 0; i < clusternormal.length; i++) {
                    if(clusternormal[i] != undefined){
                        let thisdist = 0
                        for (let m = 0; m < clusternormal[i].length; m++) {
                            thisdist += distanceto(centers[i], Kmeans.data[clusternormal[i][m]])
                        }
                        thisdistortion += thisdist / clusternormal[i].length
                    }
                }
                if (result == null || result.distortion > thisdistortion) {
                    result = {
                        distortion: thisdistortion,
                        clusters: clusters,
                        clustersnormal: clusternormal,
                        centroids: centers
                    }
                }
            }
            return result
        },
        cluster: function(numberRun) {
            let centers = [];
            if (Kmeans.center == null) {
                for (let i = 0; i < Kmeans.K; i++) {
                    centers[i] = randomcentroids()
                }
            } else {
                centers = Kmeans.center
            }

            let sdjfljsadlfjsaldkfjsla =  $.extend(true, [], centers);
            let israndom = false
            let result = null

            for (let runnum = 0; result == null||(runnum < numberRun&&israndom); runnum++) {
                let thisdistortion = 0;
                centers =  $.extend(true, [], sdjfljsadlfjsaldkfjsla);

                        for (let iterationCount = 0, centroidsChanged = true, randomCentroids = true;
                            (randomCentroids || centroidsChanged) && iterationCount < Kmeans.numberOfIterations; iterationCount++) {
                            //assign
                            let assignment = assign(Kmeans.data, centers)
                            //center
                            let sumPosition = [],
                                countPosition = [];
                            for (let i = 0; i < Kmeans.K; i++) {
                                sumPosition.push([])
                                countPosition.push(0)
                                for (let j = 0; j < Kmeans.instanceLength; j++) {
                                    sumPosition[i].push(0)
                                }
                            }
                            for (let i = 0; i < Kmeans.data.length; i++) {
                                for (let j = 0; j < Kmeans.instanceLength; j++) {
                                    sumPosition[assignment[i]][j] += Kmeans.data[i][j];
                                }
                                countPosition[assignment[i]]++;
                            }
                            centroidsChanged = false;
                            randomCentroids = false;

                            for (let i = 0; i < Kmeans.K; i++) {
                                if (countPosition[i] > 0) {
                                    let tmp = []
                                    for (let j = 0; j < Kmeans.instanceLength; j++) {
                                        tmp.push(sumPosition[i][j] / countPosition[i])
                                    }
                                    // Instance newCentroid = new DenseInstance(tmp);
                                    if (distanceto(tmp, centers[i]) > 0.0001) {
                                        centroidsChanged = true;
                                        centers[i] = tmp;
                                    }
                                } else {
                                    randomCentroids = true;
                                    israndom=true
                                    centers[i] = randomcentroids()
                                }
                            }
                        }

                        let clusters = assign(Kmeans.data, centers)
                        let clusternormal = new Array(Kmeans.K);
                        for (let i = 0; i < clusters.length; i++) {
                            if (clusternormal[clusters[i]] == undefined) {
                                clusternormal[clusters[i]] = []
                            }
                            clusternormal[clusters[i]].push(i)
                        }
                        for (let i = 0; i < clusternormal.length; i++) {
                            let thisdist = 0
                            for (let m = 0; m < clusternormal[i].length; m++) {
                                thisdist += distanceto(centers[i], Kmeans.data[clusternormal[i][m]])
                            }
                            thisdistortion += thisdist / clusternormal[i].length
                        }
                        if (result == null || result.distortion > thisdistortion) {
                            result = {
                                distortion: thisdistortion,
                                clusters: clusters,
                                clustersnormal: clusternormal,
                                centroids: centers
                            }
                        }
                }
                Kmeans.center = null;
                return result
        }
    }

function assign(data, centers) {
    let assignment = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
        let tmpCluster = 0;
        let minDistance = distanceto(centers[0], data[i]);
        for (let j = 1; j < centers.length; j++) {
            let dist = distanceto(centers[j], data[i]);
            if (dist < minDistance) {
                minDistance = dist;
                tmpCluster = j;
            }
        }
        assignment[i] = tmpCluster;
    }
    return assignment
}

function distanceto(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
        sum += (point1[i] - point2[i]) * (point1[i] - point2[i])
    }
    return Math.sqrt(sum)

}

function randomcentroids() {
    let result = [];
    for (let i = 0; i < Kmeans.instanceLength; i++) {
        result[i] = Math.floor(Kmeans.MaxandMin[1][i] + (Kmeans.MaxandMin[0][i] - Kmeans.MaxandMin[1][i]) * Math.random() + 0.5)
    }
    return result;
}

function FindMaxAndMin() {
    let MaxandMin = [
        [],
        []
    ]
    for (let i = 0; i < Kmeans.data[0].length; i++) {
        MaxandMin[0][i] = 0;
        MaxandMin[1][i] = 0;
    }

    for (let ob of Kmeans.data) {
        for (let i = 0; i < Kmeans.data[0].length; i++) {
            MaxandMin[0][i] = Math.max(ob[i], MaxandMin[0][i])
            MaxandMin[1][i] = Math.min(ob[i], MaxandMin[1][i])
        }
    }
    return MaxandMin
}

//         Dataset[] output = new Dataset[centroids.length];
//         for (int i = 0; i < centroids.length; i++)
//             output[i] = new DefaultDataset();
//         for (int i = 0; i < data.size(); i++) {
//             int tmpCluster = 0;
//             double minDistance = dm.measure(centroids[0], data.instance(i));
//             for (int j = 0; j < centroids.length; j++) {
//                 double dist = dm.measure(centroids[j], data.instance(i));
//                 if (dm.compare(dist, minDistance)) {
//                     minDistance = dist;
//                     tmpCluster = j;
//                 }
//             }
//             output[tmpCluster].add(data.instance(i));

//         }
//         return output;
module.exports = Kmeans