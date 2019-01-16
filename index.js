var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/commits');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('db connected...')

});

// db.commitcollection.insert({ "commit_id" : "12345","package_id" : "123","tested" : "123","partially-tested" : "123","not_covered" : "123", "methodsfilename" : "12345" })
var kittySchema = new mongoose.Schema({
  commit_id: String, package_id: String, tested: String, partially_tested: String, not_covered: String,methods_filename: String
});


var Kitten = mongoose.model('Kitten', kittySchema);



//Kitten.find(function (err, kittens) {
//  if (err) return console.error(err);
//  console.log(kittens);
//})


//Kitten.find({ name: /^fluff/ }, callback);


var my_context

module.exports = app => {

  app.log('Yay, the app was loaded!')


// Github sends PAYLOAD 
  app.on('push', async context => {

    var jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@130.237.59.170:8080', crumbIssuer: true })

    jenkins.job.build('test', function (err, data) {
      if (err) throw err
      console.log('queue item number', data)
    })

    my_context = context  // save payload

    app.log('push event fired')
    app.log(context.payload)

  })

// post back to GitHUB  
  const router = app.route('/')
  router.use(require('express').static('public'))

  //var express = require('express')
  var bodyParser = require('body-parser')

  // create application/json parser
  var jsonParser = bodyParser.json()

//------------------
router.get('/commitinfo/:tagId', function(req, res) {


var createHTML = require('create-html')

console.log('paramter in is: '+ req.params.tagId)

//var silence = new Kitten({ commit_id: my_context.payload.head_commit.id, package_id: package.firstElm(), tested: tested, partially_tested: partial, not_covered: not_covered$

var query  = Kitten.where({ commit_id: req.params.tagId });

query.findOne(function (err, kitten) {
  if (err) return handleError(err);
  if (kitten) {
    // doc may be null if no document matched
    console.log('hittade katten...')

    var html = createHTML({
        lang: 'en',
        dir: 'rtl',
        head: '<meta name="description" content="example">',
        body: '<p>Commit ID: ' + kitten.commit_id + '</p><p>Package: ' + kitten.package_id + '</p><p>Tested: ' + kitten.tested + '</p><p>Partially-tested: ' +kitten.partially_tested + '</p><p> Not-covered: ' + kitten.not_covered + '</p>'
    })

  res.send(html);

  }
});

//var silence = new Kitten({ commit_id: my_context.payload.head_commit.id, package_id: package.firstElm(), tested: tested, partially_tested: partial, not_covered: not_covered$

//  res.send(html);
});


// GET /p/5
// tagId is set to 5


//----------------------
  router.post('/app', jsonParser,async function (req, res) {

    var jsonQ = require('jsonq')
    var glob = require('glob')

    // files is an array of filenames.
    glob("../../../../../var/lib/jenkins/workspace/test/target/pit-reports/*/methods.json", function (err, files) {

      if (err) {
        console.log(err)
      } else {

        // a list of paths to javaScript files in the current working directory
        var jsonfile = files.slice(-1).pop()

        console.log(jsonfile)

        // nu vill jag skapa ett json object från filen.... så ja kan parsa..
        const fs = require('fs')

        let rawdata = fs.readFileSync(jsonfile)
        let methodsjson = JSON.parse(rawdata)
        var jsonQobj = jsonQ(methodsjson)

        // jenkins parsing
    //    let jenkins_json = JSON.stringify(req.body) // jenkins info...
        console.log(req.body)

        var jenkinsobj = jsonQ(req.body)

        var jenkins_status = jenkinsobj.find('build').find('status').firstElm().toLowerCase();

        var jenkins_all = jenkinsobj.find('build').find('url').firstElm()
        var jenkins_info = jenkins_all.replace(/\//g, "_")

        // replace / with _
       console.log('jenk_:'+ jenkins_info)
       console.log('jenk_status:'+ jenkins_status)

        var package = jsonQobj.find('package')
        p_methods = jsonQobj.find('methods').find('classification')

        console.log(p_methods.value())

        var tested = 0
        var partial = 0
        var not_covered = 0

        jsonQ.each(p_methods.value(), function (key, value) {
          console.log(key + ' : ' + value)

          if (value === 'tested')
            tested++

          if (value === 'partially-tested')
            partial++

          if (value === 'not-covered')
            not_covered++
        })
        console.log(tested)
        console.log(partial)
        console.log(not_covered)

        //to filter methods that are only partially tested-- fnkar inte! vetej-- kanske förman kan inte filtrera på string värden..
      
//        var createHTML = require('create-html')

//        var html = createHTML({
//          lang: 'en',
//          dir: 'rtl',
//          head: '<meta name="description" content="example">',
//          body: '<p>Commit ID: ' + my_context.payload.head_commit.id + '</p><p>Package: ' + package.firstElm() + '</p><p>Tested: ' + tested + '</p><p>Partially-tested: ' + $
//        })

//        fs.writeFile(__dirname + '/public/my_index_' + my_context.payload.head_commit.id + jenkins_info +'.html', html, function (err) {
//          if (err) console.log(err)
//        })


// commit_id: String, package_id: String, tested: String, partially_tested: String, not_covered: String,methods_filename: String

var silence = new Kitten({ commit_id: my_context.payload.head_commit.id, package_id: package.firstElm(), tested: tested, partially_tested: partial, not_covered: not_covered,methods_filename: "some_methods.json" });

  silence.save(function (err, fluffy) {
    if (err) return console.error(err);
  });

       console.log('id:'+my_context.payload.head_commit.id)

        const commitstatus = my_context.repo({

          owner: 'martinch-kth',
          repo: 'dhell',
          sha: my_context.payload.head_commit.id,
          description: jenkins_info,
          context: 'CI/jenkins',
          target_url: 'http://130.237.59.170:3000/commitinfo/' + my_context.payload.head_commit.id ,
          state: jenkins_status
        })

        return my_context.github.repos.createStatus(commitstatus)
      }
    })
  })

}
















