let tsnejs = require('./tsne.js');
let extend = require('node.extend');
const TM = {
    tsnemachine: {},
    runtsne: function(req, res, next) {

        if (req.body.matrixProjection == "true") {
                let tsne = null;
                let thistsne = new tsnejs.tSNE({
                    epsilon: 30,
                    perplexity: 10,
                    dim: req.body.dimension
                });
                thistsne.initDataRaw(req.body.vectors);
                for (var k = 0; k < 300; k++) {
                    thistsne.step(); // every time you call this, solution gets better
                }
            let resj = JSON.stringify(thistsne.getSolution());
            res.send(resj);
        } else {
            if (req.body.isnew == "true") {
                // new tsne
                let tsne = null;
                for (let run = 0; run < req.body.run; run++) {

                    let time = (new Date()).getTime()
                    let thistsne = new tsnejs.tSNE({
                        epsilon: 30,
                        perplexity: 10,
                        dim: req.body.dimension
                    });
                    thistsne.initDataRaw(req.body.vectors);
                    for (var k = 0; k < 1000; k++) {
                        thistsne.step(); // every time you call this, solution gets better
                    }
                    let thistsneP = thistsne.getSolution()

                    let thisdistortion = 0
                    for (let i = 0; i < req.body.kmeans.length; i++) {
                        let thisdist = 0
                        for (let m = 0; m < req.body.kmeans[i].length; m++) {
                            thisdist += distanceto(thistsneP[i + req.body.vectorsnumber * 1], thistsneP[req.body.kmeans[i][m]])
                        }
                        thisdistortion += thisdist / req.body.kmeans[i].length
                    }
                    if (tsne == null || tsne.distortion > thisdistortion) {
                        tsne = {
                            distortion: thisdistortion,
                            tsnemachine: thistsne
                        }
                    }
                }
                TM.tsnemachine[req.body.dimension] = tsne.tsnemachine
                // console.log(TM)

                let resj = JSON.stringify(tsne.tsnemachine.getSolution());
                res.send(resj);

            } else {
                // step
                let steptsne = extend({}, TM.tsnemachine[req.body.dimension])

                req.body.Y.forEach(o=>{
                    o[0]*=1
                    o[1]*=1
                })
                steptsne.initDataDist(req.body.vectors,req.body.Y)

                for (var k = 0; k < 100; k++) {
                    steptsne.step(); // every time you call this, solution gets better
                }
                let resj = JSON.stringify(steptsne.getSolution());
                res.send(resj);
            }
        }



    }
}

function distanceto(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
        sum += (point1[i] - point2[i]) * (point1[i] - point2[i])
    }
    return sum
}

module.exports = TM