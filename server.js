var connect = require( "connect" );
 
// obviously this is terrible      
connect( connect.static( __dirname ) ).listen( 3754 );

