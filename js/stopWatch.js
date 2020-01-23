
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
        if (seconds.length < 2) seconds = '00' + seconds;
        if (seconds.length === 2) seconds = '0' + seconds;
        return seconds;
    };

    this.start = function () {
        interval = setInterval(update.bind(this), 10);
        offset = Date.now();
        isOn = true;
    };
    this.stop = function (isChangeLevel) {
        clearInterval(interval);
        interval = null;
        isOn = false;

        var strBest = `bestTime to level ${gLevel.LEVEL}`;

        if (isChangeLevel) {
            var best = localStorage.getItem(strBest);
            if (best) {
                document.querySelector('.best-timer span').innerHTML = localStorage.getItem(strBest);
            } else {
                document.querySelector('.best-timer span').innerHTML = '000';
            }
            return;
        }

        if (!gGame.isWin) return;
        if (localStorage.getItem(strBest) === null) {
            localStorage.setItem(strBest, timeFormatter(time));
            document.querySelector('.best-timer span').innerHTML = localStorage.getItem(strBest);
        } else if (localStorage.getItem(strBest) > timeFormatter(time)) {
            localStorage.setItem(strBest, timeFormatter(time));
            document.querySelector('.best-timer span').innerHTML = localStorage.getItem(strBest);

        }
    }
    this.reset = function () {
        time = 0;
        update();
    };
    isOn = false;
};