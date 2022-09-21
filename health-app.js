const { response } = require('express');
let express = require('express'); //import express, because I want easier management of GET and POST requests.  
//let fs = require('fs');  //fs is used to manipulate the file system
let MySql = require('sync-mysql');  //MySql is used to manipulate a database connection
"use strict";
const axios = require('axios');
//set up the database connection 
const options = {
  user: 'mis37',
  password: '4TPI6F',
  database: 'mis37mercury',
  host: 'dataanalytics.temple.edu'
};

// create the database connection
const connection = new MySql(options);

let app = express();  //the express method returns an instance of a app object
app.use(express.urlencoded({extended:false}));  //use this because incoming data is urlencoded

app.use(function(req, res, next) {
    express.urlencoded({extended:false})
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();  //go process the next matching condition
  });

//supporting functions *******************************************************************
let getQuestions = function(res,questionid, questionnaire_id){
    try{
        let txtSQL = "select * from healthscreenquestions where questionnaire_id = ? AND question_id = ?"
        let results = connection.query(txtSQL,[questionnaire_id, questionid]);
        console.log(results)
        responseWrite(res,results,200);
        return;
    }
    catch(e){
        console.log(e);
        responseWrite(res, "Unexpected Error (getQuestions)", 500)
        return;

    }
}
let postResponse = function(res,questionid,usertoken,questionresponse){
    
    try{
        let txtSQL = "insert into healthscreenresponse (question_id, usertoken, response_answer) values (?, ?, ?)";
        let results = connection.query(txtSQL,[questionid, usertoken, questionresponse])
        console.log(results)
        responseWrite(res,results,200);
        return;
    }
    catch(e){
        console.log(e);
        responseWrite(res,"Unexpected Error (postResponse error)", 500)
        return;
    }
}
let markStudentComplete = function(res,usertoken, student_status){
    try{
        let txtSQL = "update students set student_status = ? where usertoken = ?"
        let results = connection.query(txtSQL,[student_status,usertoken])
        responseWrite(res, usertoken, 200)
        return;
    }
    catch(e){
        responseWrite(res, "Unexpected error (markStudentComplete)", 500)
        return;
    }
}
let checkStudentResponses = function(res,usertoken){
    try{
        let txtSQL = "select * from healthscreenresponse where usertoken = ?"
        let results = connection.query(txtSQL,[usertoken]);
        console.log(results)
        responseWrite(res,results,200);
        return;
    }
    catch(e){
        console.log(e);
        responseWrite(res, "Unexpected Error (checkStudentResponses)", 500)
        return;

    }
}

let markStudentGrade = function(res,usertoken, passFail){
    try{
        let txtSQL = "update students set passFail = ? where usertoken = ?"
        let results = connection.query(txtSQL,[passFail,usertoken])
        responseWrite(res, usertoken, 200)
        return;
    }
    catch(e){
        responseWrite(res, "Unexpected error (markStudentGrade)", 500)
        return;
    }
}

let getStudentResults = function(res,usertoken){
    try{
        let txtSQL = "select * from students where usertoken = ?"
        let results = connection.query(txtSQL,[usertoken]);
        console.log(results)
        responseWrite(res,results,200);
        return;
    }
    catch(e){
        console.log(e);
        responseWrite(res, "Unexpected Error (getStudentResults)", 500)
        return;

    }
}




/*let sendtheSMSMessage = function(res,phone, message){
   
    axios.post('https://textbelt.com/text', {
    phone: 'student_phonenumber',
    message: message,
    key: '7ebd3901625c6f66a54a6a81f878c66b1f67e774Ejpp6UNVGk48VdgV2Wp3nmtvk',
    }).then(response => {
    responseWrite(res,response.data, 200);
    })
}*/

/*                  ADMIN SUPPORTING FUNCTIONS          */
let retrieveStudentsInfo = function(res, studentstable){
    try{
        let txtSQL = "SELECT * FROM students"
        let results = connection.query(txtSQL)
        responseWrite(res, results, 200)
        return;
    }
    catch(e){
        responseWrite(res, "Unexpected Error (retrieveStudentsInfo)", 500)
        return;
    }
}

let retrieveQuestionnaireList = function(res,healthscreenquestionnaire){
    try{
        let txtSQL = "SELECT * FROM healthscreenquestionnaire"
        let results = connection.query(txtSQL)
        responseWrite(res, results, 200)
        return;
    }
    catch(e){
        responseWrite(res, "Unexpected Error (retrieveQuesionnaireList)", 500)
        return;
    }
}

//responseWrite is a supporting function.  It sends 
// output to the API consumer and ends the response.
// This is hard-coded to always send a json response.
let responseWrite = function(res,Output,responseStatus){
    res.writeHead(responseStatus, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(Output));
    res.end();
};

//error trapping ************************************************************************
app.get('/questionScreening', function(req,res,next){
    let questionid = req.query.questionid
    let questionnaire_id = req.query.questionnaire_id
    if(questionid == undefined || questionid == ""|| isNaN(questionid)){
        responseWrite(res, "The questionid is incorrect or missing", 400)
        return;
    }
    if(questionnaire_id == undefined || questionnaire_id == ""|| isNaN(questionnaire_id)){
        responseWrite(res, "The questionnaire_id is incorrect or missing", 400)
        return;
    }

    next();
});
app.post('/postAnswer', function(req,res, next){
    let questionid = req.body.questionid;
    let usertoken = req.body.usertoken;
    let questionresponse = req.body.questionresponse;
    
    if(questionid== undefined || questionid == "" || isNaN(questionid)){
        responseWrite(res, "The questionid is incorrect or missing.", 400)
        return;
    }
    if(usertoken == undefined || usertoken == "" || isNaN(usertoken)){
        responseWrite(res, "The usertoken is incorrect or missing.", 400)
        return;
    }
    if(questionresponse != "Y" && questionresponse != "N"){
        console.log("It's a trap")
        responseWrite(res, "The questionresponse is incorrect or missing.", 400)
        return;
    }
    next();
});
app.put('/markCompletion', function(req, res, next){
    let usertoken = req.body.usertoken;
    let student_status = req.body.student_status;
    if(usertoken == undefined ||usertoken == ""|| isNaN(usertoken)){
        responseWrite(res, "The usertoken is incorrect or missing",400)
        return;
    }
    if(student_status != "Y" && student_status != "N"){
        responseWrite(res, "The student_status is incorrect or missing",400)
        return;
    }
    next();
});

app.get('/checkStudent', function(req, res, next){
    let studentstable = req.query.studentstable;
    
    if(studentstable != "students"){
        responseWrite(res, "Incorrect table name", 400)
        return;
    }

    next();
})

app.get('/checkApproval', function(req, res, next){
    let usertoken = req.query.usertoken;
    
    if(usertoken == undefined ||usertoken == ""|| isNaN(usertoken)){
        responseWrite(res, "The usertoken is incorrect or missing", 400)
        return;
    }

    next();
})

app.get('/displayResults', function(req, res, next){
    let usertoken = req.query.usertoken;
    
    if(usertoken == undefined ||usertoken == ""|| isNaN(usertoken)){
        responseWrite(res, "The usertoken is incorrect or missing", 400)
        return;
    }

    next();
})

app.put('/markGrade', function(req, res, next){
    let usertoken = req.body.usertoken;
    let passFail = req.body.passFail;
    if(usertoken == undefined ||usertoken == ""|| isNaN(usertoken)){
        responseWrite(res, "The usertoken is incorrect or missing", 400)
        return;
    }
    if(passFail != "REJECTED" && passFail != "APPROVED"){
        responseWrite(res, "The passFail status is incorrect or missing", 400)
        return;
    }
    next();
});

/*                  ADMIN ERROR TRAP                */

//standard error trap goes here: check for phone and message
//400 error if they are bad, otherwise next()
app.post('/sms', function(req, res, next){
    let phone = req.body.phone
    let message = req.body.message

    sendTheSMSMessage(res, phone, message)
});

app.get('/gatherQuestionnaires', function(req, res, next){
    let questionnairetable = req.query.questionnairetable;
    
    if(questionnairetable != "healthscreenquestionnaire"){
        responseWrite(res, "Incorrect table name", 400)
        return;
    }

    next();
})

app.get('/gatherStudentsInformation', function(req, res, next){
    let studentstable = req.query.studentstable;
    
    if(studentstable != "students"){
        responseWrite(res, "Incorrect table name", 400)
        return;
    }

    next();
})

//event handlers ************************************************************************
app.get('/questionScreening', function(req,res){
    let questionid = req.query.questionid;
    let questionnaire_id = req.query.questionnaire_id;
    console.log(questionid)
    getQuestions(res, questionid, questionnaire_id);
})

app.post('/postAnswer', function(req,res){
    let questionid = req.body.questionid;
    let usertoken = req.body.usertoken;
    let questionresponse = req.body.questionresponse;
    postResponse(res,questionid,usertoken,questionresponse);
})

app.put("/markCompletion",function(req,res){
    let usertoken = req.body.usertoken;
    let student_status = req.body.student_status;
    markStudentComplete(res,usertoken,student_status);
})

app.get("/checkStudent", function(req,res){
    let studentstable = req.query.studentstable;
    retrieveStudentsInfo(res,studentstable);
})

app.get("/checkApproval", function(req,res){
    let usertoken = req.query.usertoken;
    checkStudentResponses(res,usertoken);
})

app.put("/markGrade",function(req,res){
    let usertoken = req.body.usertoken;
    let passFail = req.body.passFail;
    markStudentGrade(res,usertoken,passFail);
})

app.get("/displayResults", function(req,res){
    let usertoken = req.query.usertoken;
    getStudentResults(res,usertoken);
})


/*                  ADMIN EVENT HANDLERS            */

app.get('/gatherQuestionnaires', function(req,res){
    let questionnairetable = req.query.questionnairetable;
    retrieveQuestionnaireList(res,questionnairetable);
})

app.get('/gatherStudentsInformation', function(req,res){
    let studentstable = req.query.studentstable;
   retrieveStudentsInfo(res,studentstable);
})
//what the app should do when it received a "GET" against the root
app.get('/', function(req, res) {
    //what to do if request has no route ... show instructions
    let message = [];
    
    message[message.length] = "Issue a GET method against ./questionScreening with questionaire_id and questionid to get a JSON object of questions that will appear for students to repsond";
    message[message.length] = "Issue a POST method against ./postAnswer with usertoken, questionid, and questionresponse to post students response to database ";
    message[message.length] = "Issue a PUT method against ./markCompletion with usertoken to update students status when they complete the health screening for the week";
    message[message.length] = "Issue a GET method against ./checkStudent with usertoken to validate if student is within the database."
    message[message.length] = "Issue a GET method against ./checkStudent with usertoken to ensure student hasn't completed the screening for the week in order to proceed with screening."
    message[message.length] = "Issue a PUT method against ./markGrade with usertoken and pass/Fail to mark wether student passed or failed screening."
    message[message.length] = "Issue a GET method against ./checkApproval with usertoken to check student responses and grade whether student passed or failed weekly screening."
    message[message.length] = "Issue a GET method against ./displayResults with usertoken to relay students pass or fail back to the student."
    message[message.length] = "---------ADMINISTRATOR FEATURES BELOW---------"
    message[message.length] = "Issue a GET method against ./gatherQuestionnaires with questionnairetable to display all possible questionnaires administrator could select to send out."
    message[message.length] = "Issue a GET method against ./gatherStudentsInformation with studentstable to gather list all of students' phone numbers to send out weekly screenings."
    //message[message.length] = "Issue a POST to /sms and provide phone and message to send an SMS message."

	responseWrite(res,message,200);
    return
});
  
//This piece of code creates the server  
//and listens for requests on a specific port
//we are also generating a message once the 
//server is created
let server = app.listen(8214, "0.0.0.0" ,function(){
    let host = server.address().address;
    let port = server.address().port;
    console.log("The endpoint server is listening on port:" + port);
});
