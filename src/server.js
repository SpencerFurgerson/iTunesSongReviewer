/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();
const axios = require('axios');

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.
		We'll be using `db` as this is the name of the postgres container in our
		docker-compose.yml file. Docker will translate this into the actual ip of the
		container for us (i.e. can't be access via the Internet).
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab,
		we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database. We set this in the
		docker-compose.yml for now, usually that'd be in a seperate file so you're not pushing your credentials to GitHub :).
**********************/
const dev_dbConfig = {
	host: 'db',
	port: 5432,
  database: process.env.POSTGRES_DB,
	user:  process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};

/** If we're running in production mode (on heroku), the we use DATABASE_URL
 * to connect to Heroku Postgres.
 */
const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

// Heroku Postgres patch for v10
// fixes: https://github.com/vitaly-t/pg-promise/issues/711
if (isProduction) {
  pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}

const db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

// login page
app.get('/', function(req, res) {
	res.render('pages/main',{
		local_css:"signin.css",
		page_title:"Main Page",
    items: '',
    songName: ''
	});
});

app.get('/main', function(req, res) {
	res.render('pages/main',{
		local_css:"signin.css",
		page_title:"Main Page",
    items: '',
    songName: ''
	});
});

app.post('/get_search', function(req, res) {
  var title = req.body.search; //TODO: Remove null and fetch the param (e.g, req.body.param_name); Check the NYTimes_home.ejs file or console.log("request parameters: ", req) to determine the parameter names

  if(title) {
    axios({
        url: `https://itunes.apple.com/search?term=${title}&country=us&media=music`,
        method: 'GET',
        dataType:'json',
      })
        .then(items => {

          res.render('pages/main',{
            page_title: "Main",
            error: false,
            items: items.data.results,
            numResults: Object.keys(items.data.results).length,
            songName: items.data.results[0].trackName

          })

        })
        .catch(error => {

          res.render('pages/main',{
            page_title: "Main",
            items: '',
            error: true,
            songName: ''

          })
        });


  }

});

// registration page
app.get('/reviews', function(req, res) {
  var query = "select * from song_reviews;";

  db.any(query)
	.then(function (rows) {
    res.render('pages/reviews',{
  		page_title: 'Reviews',
  		css: 'resources/css/style.css',
      songs: rows,
  		error: false,

  	});

	})
	.catch(function (err) {

		res.render('pages/main', {
			page_title: 'Main',
      data: '',
			css: 'resources/css/style.css',
			error: true,
			items: '',

		})
	})
});

app.post('/get_filter', function(req, res) {
  var filter = req.body.filtterm;

  var query = "select * from song_reviews where upper(songTitle) like upper('%"+filter+"%');";

  db.any(query)
	.then(function (rows) {
    res.render('pages/reviews',{
  		page_title: 'Reviews',
  		css: 'resources/css/style.css',
      songs: rows,
  		error: false,

  	});

	})
	.catch(function (err) {
		res.render('pages/main', {
			page_title: 'Main',
      data: '',
			css: 'resources/css/style.css',
			error: true,
			items: '',

		})
	})
});

app.get('/main/review', function(req, res) {

  var songTitle = req.body.search;

  res.render('pages/main',{
		local_css:"signin.css",
		page_title:"Main Page",
    items: '',
    songName: songTitle
	});
});

app.post('/main/postreview', function(req, res) {

  var namer = req.body.songNamer;

  var today = new Date();

  var songReview = req.body.reviewBox;

	var insert_statement = "INSERT INTO song_reviews(songTitle, review, reviewDate) VALUES ('"+namer+"', '"+songReview+"', '"+today+"');";
  var query = "select * from song_reviews;";

  db.task('get-everything', task => {
        return task.batch([
            task.any(insert_statement),
            task.any(query)
        ]);
    })
    .then(info => {
    	res.render('pages/reviews',{
        page_title: 'Reviews',
    		css: 'resources/css/style.css',
        songs: info[1],
    		error: false,
			})
    })
		.catch(function (err) {

			res.render('pages/main', {
				page_title: 'Main',
				data: '',
				css: 'resources/css/style.css',
				error: true,
        items: '',
        songName: ''

			})
		})
	});








//app.listen(3000);
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
