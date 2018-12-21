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

    var jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@130.237.59.170:8080', crumbIssuer: true })

    jenkins.job.build('test', function (err, data) {
      if (err) throw err
      console.log('queue item number', data)
    })

    my_context = context  // save payload

    app.log('push event fired')
    app.log(context.payload)

    /*
        const commitComment = context.repo({

          owner: 'martinch-kth',
          repo: 'dhell',
          sha: my_context.payload.head_commit.id,
          description: 'this comment was been updated by probot!',
          context:'continuous-integration/jenkins',
          target_url:'http://130.237.59.170:3000/my_index_'+ my_context.payload.head_commit.id  +'.html',
          state: 'success'
        })
    */

    // return context.github.repos.createStatus(commitComment)
  })

////////////SETUP PARSING /////////////////////////////////////////////

  var bodyParser = require('body-parser').json()

  const router = app.route('/')
  router.use(require('express').static('public'))

  //Here we are configuring express to use body-parser as middle-ware.
  router.use(bodyParser.urlencoded({ extended: false }))
  router.use(bodyParser.json())

  router.post('/app', bodyParser,async function (req, res) {

    var jsonQ = require('jsonq')
    var glob = require('glob')

    // files is an array of filenames.
    glob('../../../../../var/lib/jenkins/workspace/test/target/pit-reports/*/methods.json', function (err, files) {

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

        let jenkins_json = JSON.parse(req.body) // jenkins info...
        var jenkinsobj = jsonQ(jenkins_json)
        var jenkins_info = jenkinsobj.find('build').find('url').value()
            jenkins_info.replace(/\//g, "_");// replace / with _

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
        // DONT WORKS...somethingswrong..
//    console.log(filterdHub.value());
        //   filterdHub.each(function (index, path, value) {
        //       console.log(value);
        //       console.log(index);
//        console.log(path);
//    });

        var createHTML = require('create-html')

        var html = createHTML({
          lang: 'en',
          dir: 'rtl',
          head: '<meta name="description" content="example">',
          body: '<p>Title: ' + my_context.payload.head_commit.id + '</p><p>Stats: ' + package.firstElm() + '</p><p>Tested: ' + tested + '</p><p>Partially-tested: ' + partial + '</p><p>Not-covered: ' + not_covered + '</p>'
        })

        fs.writeFile(__dirname + '/public/my_index_' + my_context.payload.head_commit.id + '_'+ jenkins_info +'.html', html, function (err) {
          if (err) console.log(err)
        })

        const commitComment = my_context.repo({

          owner: 'martinch-kth',
          repo: 'dhell',
          sha: my_context.payload.head_commit.id,
          description: 'Jenkins info: '+ jenkins_info,
          context: 'continuous-integration/jenkins',
          target_url: 'http://130.237.59.170:3000/my_index_' + my_context.payload.head_commit.id +'_'+ jenkins_info +'.html',
          state: 'success'
        })

      }
    })

    return my_context.github.repos.createStatus(commitComment)
  })

}
