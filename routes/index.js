
/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};*/

exports.index = function(req, res)
{
    res.render
    (
    	'index', 
    	{
      		title: 'Stargazers',
      		stargazers: [{name:'josh', html_url:'http://www.jjnoble.co.uk'}]
    	}
    );
};