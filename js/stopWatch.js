function timerWatch(elem) {

    var time = 0;
    var offset;
    var interval;
    var isOn;

    function update() {
        if (isOn) time += delta();
        elem.textContent = timeFormatter(time);
    }

    function delta() {
        var now = Date.now();
        var timePassed = now - offset;
        offset = now
        return timePassed;
    };

    function timeFormatter(time) {
        time = new Date(time);
        var seconds = time.getSeconds().toString();

        if (seconds.length <= 2) {
            seconds = '00' + seconds;
        }
        return seconds;
    };

    this.start = function () {
        interval = setInterval(update.bind(this), 10);
        offset = Date.now();
        isOn = true;
    };
    this.stop = function () {
        clearInterval(interval);
        interval = null;
        isOn = false;

    }
    this.reset = function () {
        time = 0;
        update();
    };
    isOn = false;
};