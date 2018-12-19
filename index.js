/*
const SmeeClient = require('smee-client')

const smee = new SmeeClient({
  source: 'https://smee.io/sdfasdf',
  target: 'http://localhost:3000/events',
  logger: console
})

const events = smee.start()

*/

// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

var my_context

module.exports = app => {

  app.log('Yay, the app was loaded!')

    app.on('push', async context => {

      app.log('Code was pushed to the repo, what should we do with it?');// context.log  innnan....

      var jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@130.237.59.170:8080', crumbIssuer: true });

      jenkins.job.build('test', function (err, data) {
        if (err) throw err;
        console.log('queue item number', data);
      });

      my_context = context  // save payload

      app.log('push event fired')
      app.log(context.payload)


    const commitComment = context.repo({

      owner: 'martinch-kth',
      repo: 'dhell',
      sha: my_context.payload.head_commit.id,
      description: 'this comment was been updated by probot!',
      context:'continuous-integration/jenkins',
      target_url:'http://130.237.59.170:3000/my_index_'+ my_context.payload.head_commit.id  +'.html',
      state: 'success'
    })

// brukar vara return (context.github.repos.createCommitComment(commitComment))

    //testa..

    return context.github.repos.createStatus(commitComment)



      // Post a comment on the issue
      //return context.github.issues.createComment(params)
    })


////////////SETUP PARSING /////////////////////////////////////////////

 // var bodyParser = require('body-parser')
 // var jsonParser = bodyParser.json() // create application/json parser
//  var urlencodedParser = bodyParser.urlencoded({ extended: false })  // create application/x-www-form-urlencoded parser
  var bodyParser = require("body-parser");


  const router = app.route('/')         // https://localhost:3000/my-app/job-f to access the endpoint.
  router.use(require('express').static('public'))

//Here we are configuring express to use body-parser as middle-ware.
  router.use(bodyParser.urlencoded({ extended: false }));
  router.use(bodyParser.json());



  // GET method route
 // router.get('/', function (req, res) {
 //   res.send('GET request to the homepage')
//  })

  //  router.post('/', function (req, res) {
  router.post('/app',function (req, res) {

    app.log ('POOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOST')

    app.log(req.body)
    console.log(req.body)

   // app.log('jenkins responce back to kth server')
    // 1. ta emot jenkins data -> parsa ut det du vill ha... -> skapa html sida fake just nu.. -> skicka github API url stuff..med länk till html sida

// Read Synchrously
// var fs = require("fs");
//    console.log('\n *START* \n')
//    var content = require('fs').readFileSync('content.txt')
//    console.log('Output Content : \n' + content)
//    console.log('\n *EXIT* \n')

// report are at....
// martinch@server170:/var/lib/jenkins/workspace/test/target/pit-reports$

// ..my path...
// ../../../../../var/lib/jenkins/workspace/test/target/pit-reports

    // 201811201810  201811230847  201811261320  201811261347	201811291030  201811291033  201811291117  201811291121	201811291134  201811301330

    /*
    var obj = require('./myjson'); // no need to add the .json extension
    var jsonQobj=jsonQ(jsonObj);

    jsonQ(jsonObj).find("name").value();
    */

    // jenkins data..........
   // console.log(req.body)

    // TROR EJ de ska va här..men ..
    /*
{
  "state": "success",
  "target_url": "https://example.com/build/status",
  "description": "The build succeeded!",
  "context": "continuous-integration/jenkins"
}
 octokit.repos.createStatus({owner, repo, sha, state, target_url, description, context})
     


    const commitComment = my_context.repo({

      owner: 'martinch-kth',
      repo: 'dhell',
      sha: my_context.payload.head_commit.id,
      description: 'This commit has been updated by probot!',
      context:"continuous-integration/jenkins",
      target_url:'http://www.mystaticpage.com',
      state: "success"
    })

  var commit_id = my_context.payload.head_commit.id
*/

  // brukar vara return (context.github.repos.createCommitComment(commitComment))

    var jsonQ=require("jsonq");
    var glob = require("glob")
    
      // files is an array of filenames.
    glob('../../../../../var/lib/jenkins/workspace/test/target/pit-reports/*/methods.json', function (err, files) {

    if (err) {
        console.log(err);
    } else {

        // a list of paths to javaScript files in the current working directory
        //console.log(files);
        var jsonfile = files.slice(-1).pop()

        console.log(jsonfile)

    // nu vill jag skapa ett json object från filen.... så ja kan parsa..?
    const fs = require('fs');

    let rawdata = fs.readFileSync(jsonfile)  
//    let rawdata = fs.readFileSync('../../../../../var/lib/jenkins/workspace/test/target/pit-reports/201812181938/methods.json');  
    let methodsjson = JSON.parse(rawdata);  


   // var obj = require(filepath); // no need to add the .json extension
    var jsonQobj=jsonQ(methodsjson);

    var package = jsonQobj.find('package');

   // name = jsonQobj.find('name');

 
    //to print list of all name
   // console.log(name.value());

   // methods = jsonQobj.find('methods');

    //WARNING.. just a workaround for now to get amount of methods..since i cant get methods.lenght ..it gives = 1..which is true..i have to loop+count
   // console.log(name.length);

    //to partially-tested methods 
    p_methods = jsonQobj.find('methods').find('classification');

    console.log(p_methods.value())

    var tested = 0;
    var partial = 0;
    var not_covered = 0;
    

    jsonQ.each(p_methods.value(), function (key, value) {
        console.log(key + ' : ' + value);

       if (value === 'tested')
           tested++

       if (value === 'partially-tested')
           partial++

       if (value === 'not-covered')
           not_covered++
    });

    console.log(tested)
    console.log(partial)
    console.log(not_covered)

    //to filter methods that are only partially tested-- fnkar inte! vetej-- kanske förman kan inte filtrera på string värden..
    // DONT WORKS...somethingswrong..
//    console.log(filterdHub.value());
 //   filterdHub.each(function (index, path, value) {
 //       console.log(value);
 //       console.log(index);
//        console.log(path);
//    });

    //testa..funkar!!

    var createHTML = require('create-html')

var html = createHTML({
  lang: 'en',
  dir: 'rtl',
  head: '<meta name="description" content="example">',
  body: '<p>Title: '+ my_context.payload.head_commit.id +'</p><p>Stats: '+ package.firstElm() +'</p><p>Tested: '+ tested +'</p><p>Partially-tested: '+ partial +'</p><p>Not-covered: '+ not_covered +'</p>'
})
                // + commit_id
    fs.writeFile(__dirname + '/public/my_index_'+ my_context.payload.head_commit.id +'.html', html, function (err) {
      if (err) console.log(err)
    })


    }
   });


 //FIXA ASAP->  ja de borde  vara här...inte innnan..som jag har nu ..
 //   res.send(my_context.github.repos.createStatus(commitComment))

   // res.send('hiii---')
  })

}
