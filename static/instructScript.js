let originalArr = [];
let stepLists = [];

let jsav = new JSAV("av");
let instructionLabel;
let nextInstructionLabel;
let originalList;


let curStepArr = '';
let curInstruction = '';
let curStepNo = 0;

let nextStepArr = '';
let nextInstruction = '';
let nextStepNo = 1;

let instruct = [];
let stepNo = [];
let stepArr = [];

$(document).ready(function () {
    $("#restart").hide();
    $("#split").hide();
    $("#merge").hide();
    $("#arrayInputForm").hide();
    $(".visualFeedback").hide();
    $("#nextBtn").hide();
    $("#time").hide();
    $("#timeto").hide();
});

// originalList.highlight(2);
// originalList.css(4, { "background-color": "aqua", "color": "rgb(150, 55, 50)" });
// originalList.layout();

//displays unsorted array 
function getArray(size, range) {
    let xReq = new XMLHttpRequest();
    xReq.onreadystatechange = displayArray;

    xReq.open('GET', `/array?size=${size}&range=${range}`, true);
    xReq.send();
}

function displayArray() {
    // ensures ready state is met before running
    if (this.readyState == 4 && this.status == 200) {
        originalArr = [];
        stepLists = [];
        $('#startbtn').hide();
        // document.getElementById('startbtn').style.visibility = "hidden";

        this.responseText.split(',').forEach(element => {
            originalArr.push(parseInt(element))
        });

        originalList = jsav.ds.array(originalArr);
        instructionLabel = jsav.label('Starting Array');
        nextInstructionLabel = jsav.label('Next: ');
        $('#av').show();
        $('#split').show();
        $('#merge').show();
        $(".visualFeedback").show();
        $("#nextBtn").show();
        $("#time").show();
        $("#timeto").show();
    }
}

//displays steps when the sort button is pressed 
function getArray2() {
    let xReq = new XMLHttpRequest();
    xReq.onreadystatechange = displayArray2;

    xReq.open('GET', '/array2', true);
    xReq.send();
}

let waitForPressResolve;
function waitForPress() {
    return new Promise(resolve => waitForPressResolve = resolve);
}

function btnResolver() {
    if (waitForPressResolve) waitForPressResolve();
}


function displayArray2() {
    if (this.readyState == 4 && this.status == 200) {
        let instructions = JSON.parse(this.responseText);

        for (i in instructions) {
            if (i % 2 == 0) {
                instruct.push(instructions[i].instruction);
                stepNo.push(instructions[i].stepNo);
            } else {
                stepArr.push(instructions[i]);
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////
        const btn = document.getElementById('nextBtn');

        async function doIt() {
            btn.addEventListener('click', btnResolver);

            for (p in stepArr) {
                p = parseInt(p)
                await waitForPress();
                curInstruction = instruct[p];
                curStepArr = stepArr[p];
                curStepNo = stepNo[p];

                try {
                    nextInstruction = 'Next: ' + instruct[p + 1];
                    nextStepArr = stepArr[p + 1];
                    nextStepNo = stepNo[p + 1];
                }
                catch {
                    nextInstruction = ''
                    nextStepArr = ''
                    nextStepNo = 0
                }

                if ([2, 6, 7, 8].includes(nextStepNo)) {
                    $("#nextBtn").prop("disabled", true);
                    $("#split").prop("disabled", false);
                    $("#merge").prop("disabled", false);
                }
                else {
                    $("#nextBtn").prop("disabled", false);
                    $("#split").prop("disabled", true);
                    $("#merge").prop("disabled", true);
                }

                if (nextStepNo === 9) {
                    $("#mergeNum").prop("disabled", true);
                }
                else {
                    $("#mergeNum").prop("disabled", false);
                }

                if (curStepNo === 8 && nextStepNo !== 8) {
                    $("#arrayInputForm").hide();
                }

                instructionLabel.text(curInstruction)
                nextInstructionLabel.text(nextInstruction)

                for (let arr of stepLists) {
                    arr.clear();
                }
                for (let arr of curStepArr) {
                    let stepArr = [];
                    try {
                        arr.split(',').forEach(element => {
                            stepArr.push(parseInt(element))
                        });
                    }
                    catch {
                        arr.forEach(element => { stepArr.push(element) });
                    }
                    stepLists.push(jsav.ds.array(stepArr));
                }

                if (curStepNo === 3) {
                    let highlightedArr = $('.jsavarray')[2];
                    for (let index of highlightedArr.children) {
                        index.style = 'background: yellow'
                    }
                }
                if (curStepNo === 4) {
                    let highlightedArr = $('.jsavarray')[3];
                    for (let index of highlightedArr.children) {
                        index.style = 'background: yellow'
                    }
                }
                if (curStepNo === 9) {
                    let highlightedArrs = $('.jsavarray');
                    highlightedArrs[2].children[0].style = 'background: yellow';
                    highlightedArrs[3].children[0].style = 'background: yellow';
                }
                $("span:contains('NaN')").text('');

            }
            btn.removeEventListener('click', btnResolver);
            // alert('Finished');
            completeAttempt(true);
            $('#split').hide();
            $('#merge').hide();
            $("#nextBtn").hide();
            $("#restart").show();
        }
        doIt();
    }
}

function restart() {
    completeAttempt(false);

    $("#main").show();
    gameover = document.getElementById("gameovermenu");
    gameover.style.visibility = "hidden";
    document.getElementById('CheckMarkCorrect').style.visibility = "hidden";
    document.getElementById('XMarkIncorrect1').style.visibility = "hidden";
    document.getElementById('XMarkIncorrect2').style.visibility = "hidden";
    document.getElementById('XMarkIncorrect3').style.visibility = "hidden";

    $('.jsavarray').remove();
    $('.jsavlabel').remove();
    $('#restart').hide();
    for (let arr of stepLists) {
        arr.clear();
    }

    getArray();
    getArray2();

}

var soundCorrect = new Audio('audioVisual/Correct.mp3');
var soundIncorrect = new Audio('audioVisual/Wrong.mp3');

function isHidden(mark) {
    var style = window.getComputedStyle(mark);
    return (style.visibility === 'hidden')
}

///TODO: make sure the check mark is hidden when switching between levels, restarting levels, etc.
function displayFeedback(x) {
    var checkmark = document.getElementById('CheckMarkCorrect');
    var style = '';

    if (x == 0) { // Correct step
        checkmark.style.visibility = "visible";
    }
    else if (x == 1) { // Incorrect step
        checkmark.style.visibility = "hidden";

        ///TODO: there might be a more elegant way to approach this
        if (isHidden(document.getElementById('XMarkIncorrect1'))) {
            document.getElementById('XMarkIncorrect1').style.visibility = "visible";
        }
        else if (isHidden(document.getElementById('XMarkIncorrect2'))) {
            document.getElementById('XMarkIncorrect2').style.visibility = "visible";
        }
        else if (isHidden(document.getElementById('XMarkIncorrect3'))) {
            completeAttempt(false);

            document.getElementById('XMarkIncorrect3').style.visibility = "visible";


            gameover = document.getElementById("gameovermenu");
            gameover.style.visibility = "visible";
            $("#main").hide();


        }
        //would be the 4th mistake 
        else {
        }
    }
}

function handleValidation(isCorrect) {
    if (isCorrect) {
        //handleCorrect(); ///TODO: create function and check for parameters

        displayFeedback(0);
        soundCorrect.play();

        btnResolver();
        // hide the buttons if there is no input required for the next step


    } else {
        //handleIncorrect(); ///TODO: create function and check for parameters
        soundIncorrect.play();
        displayFeedback(1);
        //soundIncorrect.play();

    }
}


function handleSplitClicked() {
    handleValidation(nextStepNo === 2);
}

function handleMergeForm() {
    if (nextStepNo === 6) {
        handleValidation(true);
        $("#arrayInputForm").show();
    }
    else {
        handleValidation(false);
    }
}
function handleMergeClicked() {
    let num = document.getElementById("arrayInput").value;
    handleUserInput(num);
}

function handleUserInput(value) {
    value = parseInt(value);
    let valArr = [];
    nextStepArr[0].split(',').forEach(element => {
        valArr.push(parseInt(element))
    });
    // check if the user inputs the next value which is supposed to be added to the array
    lastNonNull = valArr.filter(x => !isNaN(x)).slice(-1)[0];
    handleValidation((nextStepNo === 7 || nextStepNo === 8) && value === lastNonNull);
}

////////////////////////DISPLAYED TIMER

//initializing variables 
let minute = 0;
let second = 0;
let millisecond = 0;

let cron;



function start() {
    pause();
    cron = setInterval(() => { timer(); }, 10);
}

function pause() {
    clearInterval(cron);
}

//resets all values when reset button is pushed 
function reset() {

    minute = 0;
    second = 0;
    millisecond = 0;

    document.getElementById('minute').innerText = '00';
    document.getElementById('second').innerText = '00';


}

function timer() {
    if ((millisecond += 10) == 1000) {
        millisecond = 0;
        second++;
    }
    //if 60 seconds pass then minute increments and seconds display resets
    if (second == 60) {
        second = 0;
        minute++;
    }


    document.getElementById('minute').innerText = returnData(minute);
    document.getElementById('second').innerText = returnData(second);

}

function returnData(input) {
    return input > 10 ? input : `0${input}`
}

///////////////////////////INACTIVITY TIMER
//initializing variables 
let minuteto = 0;
let secondto = 0;
let millisecondto = 0;

let cron1;



function startto() {
    pauseto();
    cron1 = setInterval(() => { timerto(); }, 10);
}

function pauseto() {
    clearInterval(cron1);
}

//resets all values when reset button is pushed 
function resetto() {

    minuteto = 0;
    secondto = 0;
    millisecondto = 0;

    document.getElementById('minuteto').innerText = '00';
    document.getElementById('secondto').innerText = '00';


}

//fuction to deal with timeout 
function timeout() {
    //alert("You have timed out");
    //redirect to menu page
    completeAttempt(false);
    window.location.replace("http://localhost:2009/index.html");
}

function timerto() {
    if ((millisecondto += 10) == 1000) {
        millisecondto = 0;
        secondto++;
    }
    //if 60 seconds pass then minute increments and seconds display resets
    if (secondto == 60) {
        secondto = 0;
        minuteto++;
    }
    //if 5 minutes have passed then trigger timeout 
    if (minuteto == 5) {
        timeout();
    }

    try {
        document.getElementById('minuteto').innerText = returnDatato(minuteto);
        document.getElementById('secondto').innerText = returnDatato(secondto);
    }
    catch { }

}

function returnDatato(input) {
    return input > 10 ? input : `0${input}`
}

function registerAttempt(level) {
    let xReq = new XMLHttpRequest();
    xReq.onreadystatechange = function () {
        if (this.status == 401) {
            window.location.replace('/notLoggedIn.html');
        }
        else if (this.readyState == 4 && this.status == 200) {

        }
    }

    xReq.open('GET', `/registerattempt?level=${level}`, true);
    xReq.send();
}

function completeAttempt(success) {
    let xReq = new XMLHttpRequest();
    xReq.onreadystatechange = function () {
        if (this.status == 401) {
            window.location.replace('/notLoggedIn.html');
        }
        else if (this.readyState == 4 && this.status == 200) {

        }
    }

    xReq.open('GET', `/completeattempt?success=${success}`, true);
    xReq.send();
}

$(window).bind('beforeunload', function () {
    completeAttempt(false);
});
