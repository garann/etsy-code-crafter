var Etsy = Etsy || {};

( function( Etsy ) {

    Etsy.widgets = [];
    Etsy.codeCrafter = function( options, index ) {
        
        var that = this;
        
        this.index = index;
        this.selector = options.selector || ".code-crafter";
        this.tmpl_path = options.tmpl_path || "code-crafter.tmpl";
        this.data = options.data;
        this.params = options.params || { api: "" };

        this.init = function() {
            _xhr( this.tmpl_path, function( ) {
                that.template = this.responseText;
                that.render = function( d ) {
                    document.querySelector( that.selector ).innerHTML = doT.template( that.template )( d );
                };

                var url = that.data + "?",
                    querystring = [],
                    el;
                for ( var k in that.params ) {
                    querystring.push( k + "=" + that.params[k] );
                };
                querystring.push( "callback=Etsy.widgets[" + that.index + "].render" );
                el = document.createElement( "script" );
                el.src = url + querystring.join( "&" );
                document.body.appendChild( el );
            });
        };

        return this;

    };

    // load templating engine
    var _dot = document.createElement( "script" );
    _dot.src = "doT.min.js";
    document.body.appendChild( _dot );
    // once DOM is ready, render templates
    document.onreadystatechange = function() {
        Etsy.widgets.forEach( function( widget, index ) {
            Etsy.widgets[ index ] = new Etsy.codeCrafter( widget, index );
        });
    };

    var _xhr = function( url, callback ) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            // swallow errors
            if ( req.readyState === 4 && req.status === 200 ) {
                callback.call( req );
            }
        };
        req.open( "GET", url, true );
        req.send( null );
    };

})( Etsy );