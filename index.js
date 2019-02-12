var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/commits');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('db connected...')

});

// db.commitcollection.insert({ "commit_id" : "12345","package_id" : "123","tested" : "123","partially-tested" : "123","not_covered" : "123", "methodsfilename" : "12345" })
var statsSchema = new mongoose.Schema({
    commit_id: String, package_id: String, tested: String, partially_tested: String, not_covered: String, url_link: String, treemap : String
});

var Stats = mongoose.model('Stats',statsSchema);

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

//------------------ DET HÄR SKA inTE H*NDA här mer.. vi ska bara spara undan till DB..

    /*
    router.get('/commitinfo/:tagId', function(req, res) {


    var createHTML = require('create-html')

    console.log('paramter in is: '+ req.params.tagId)

    //var silence = new Kitten({ commit_id: my_context.payload.head_commit.id, package_id: package.firstElm(), tested: tested, partially_tested: partial, not_covered: not_covered$

    var query  = Stats.where({ commit_id: req.params.tagId });

    query.findOne(function (err, stats) {
      if (err) return handleError(err);
      if (stats) {
        // doc may be null if no document matched
        console.log('hittade...')

        var html = createHTML({
            lang: 'en',
            dir: 'rtl',
            head: '<meta name="description" content="example">',
            body: '<p>Commit ID: ' + stats.commit_id + '</p><p>Package: ' + stats.package_id + '</p><p>Tested: ' + stats.tested + '</p><p>Partially-tested: ' + stats.partially_tested + '</p><p> Not-covered: ' + stats.not_covered + '</p>'
        })

      res.send(html);

      }
     });
    });

    */

//_________________

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

// skriva metoder som.. läser från fil.. .json...
////////////////////////////////////////////////////////////////////////
  //              var jsonfile = "methods.json"

// nu vill jag skapa ett json object från filen.... så ja kan parsa..
                const fs = require('fs')

                let rawdata = fs.readFileSync(jsonfile)
                let methodsjson = JSON.parse(rawdata)

                var allmethods = methodsjson.methods

                var temp = []
// loop all methods..

                for(var i = 0; i < allmethods.length; i++)
                {
                    var obj = allmethods[i];

                    console.log(obj.classification);

                    temp.push(obj.package)

                }

                var uniqueItems = Array.from(new Set(temp))

                var array_all = []

                for(var i = 0; i < uniqueItems.length; i++)
                {
                    var obj = uniqueItems[i];

                    var jsonObj_child = {
                        "name": obj,
                        "tested": 0,
                        "notcovered": 0,
                        "partiallytested": 0
                    };

                    array_all.push(jsonObj_child)
                }


                for(var i = 0; i < allmethods.length; i++)
                {
                    var obj = allmethods[i];

                    console.log(obj.package);
                    console.log(obj.classification);

                    array_all.forEach(function(entry) {

                        if(obj.package === entry.name)
                        {
                            // lets count them ways..
                            if (obj.classification === 'tested' )
                            {
                                entry.tested = entry.tested + 1
                            }
                            if (obj.classification === 'partially-tested' )
                            {
                                entry.partiallytested = entry.partiallytested + 1
                            }
                            if (obj.classification === 'not-covered' )
                            {
                                entry.notcovered = entry.notcovered + 1
                            }
                        }
                    });
                }

                array_all.forEach(function(entry) {
                    console.log(entry);
                });

                var treemap='{"name":"Mutation test","color":"hsl(187, 70%, 50%)","children":['

                array_all.forEach(function(i, idx, array){

                    var pacpac='{"name":"' + String(i.name) +'","color":"hsl(87, 70%, 50%)","children":[' +

                        '{"name": "Tested",' +
                        '"color":"hsl(299, 70%, 50%)",' +
                        '"loc":' + i.tested +
                        '},{"name":"Partially tested",' +
                        '"color": "hsl(143, 70%, 50%)",' +
                        '"loc": ' + i.partiallytested +
                        '},{"name": "Not covered",' +
                        '"color": "hsl(12, 70%, 50%)",' +
                        '\"loc\": ' + i.notcovered

                    var tail= '}]},'
                    var last_tail= '}]}'


                    if (idx === array.length - 1){
                        console.log("Last callback call at index " + idx + " with value " + i );
                        treemap = treemap + pacpac + last_tail

                    }else {
                        treemap = treemap + pacpac + tail
                    }
                });


                var close_tree = ']}'

                treemap = treemap + close_tree

///////////////////////////////////////////////////////////////////7
                
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


//                var stat = new Stats({ commit_id: my_context.payload.head_commit.id, package_id: package.firstElm(), tested: tested, partially_tested: partial, not_covered: not_covered, url_link: my_context.payload.head_commit.url ,treemap : treemap });
                var stat = new Stats({ commit_id: my_context.payload.head_commit.id, package_id: 'hej', tested: 3, partially_tested: 3, not_covered: 3, url_link: my_context.payload.head_commit.url ,treemap : treemap });




                stat.save(function (err, somestat) {
                    if (err) return console.error(err);
                });

                console.log('id:'+my_context.payload.head_commit.id)

                const commitstatus = my_context.repo({

                    owner: 'martinch-kth',
                    repo: 'commons-codec',
                    sha: my_context.payload.head_commit.id,
                    description: jenkins_info,
                    context: 'CI/jenkins',
                    target_url: 'http://130.237.59.170:3002/' + my_context.payload.head_commit.id ,
                    state: jenkins_status
                })

                return my_context.github.repos.createStatus(commitstatus)
            }
        })
    })

}

