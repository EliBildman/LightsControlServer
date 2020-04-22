const Promise = require('promise');

//asink and sink are lists of {task: function pointer, param: parameter}
//all askinks must return promise
module.exports =  handleRuns = (asink, sink) => {

    asink = asink.map(task => { return {run: task.task, param: task.param, finished: false, return: null} });
    sink = sink.map(task => {return {run: task.task, param: task.param, return: null} });


    let runASink = () => {
        for(task of asink) {
            task.run(task.param).then((re) => {
                task.finished = true;
                task.return = re;
                done();
            });
        }
    }

    let done = () => {
        for(task of asink) {
            if(!task.finished) return;
        }
        runSink();
    }

    let runSink = () => {

        for(task of sink) {
            task.return = task.run(task.param);
        }

        returnValue = {
                    asink: asink.map((task) => { return {task: task.run, return: task.return} }),
                    sink: sink.map((task) => { return {task: task.run, return: task.return} })
        };
        
    }

    runASink();
    return promise;

}