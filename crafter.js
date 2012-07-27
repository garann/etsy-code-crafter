var Etsy = Etsy || {};

( function ( Etsy ) {

    // constants
    Etsy.tmpls = {
        "tool-container": '<div class="container"></div>',
        "tool-text": '<div class="text"><span class="text-edit" contenteditable="true">Enter text</span></div>',
        "Listing": '<a class="api-data api-text">title</a><a class="api-data api-text">description</a><a class="api-data api-text">price</a>',
        "ListingImage": '<a class="api-data api-image">url_75x75</a><a class="api-data api-image">url_170x135</a><a class="api-data api-image">url_570xN</a><a class="api-data api-image">url_fullxfull</a>',
        "Shop": '<a class="api-data api-text">shop_name</a><a class="api-data api-text">title</a><a class="api-data api-text">url</a><a class="api-data api-image">image_url_760x100</a>',
        "User": '<a class="api-data api-text">login_name</a><a class="api-data api-text">bio</a><a class="api-data api-text">city</a><a class="api-data api-text">first_name</a><a class="api-data api-text">last_name</a><a class="api-data api-image">image_url_75x75</a>'
    };
    Etsy.coords = {
        top: 0,
        left: 0
    };

    // cache main interface elements
    var $c = $( ".container" ),
        $add = $( "#add-object" ),
        $prev = $( ".preview" ),
        objects = {},
        apikey = "?api_key=[PUT KEY HERE]";

    // init
    $c.mouseup( function( e ) {
        var $t = $( this ),
            $h = $t.next( ".height-meter" ),
            $w = $h.next( ".width-meter" ),
            h,
            w;
        h = $t.height();
        w = $t.width();
        $h.width( h );
        $h.css( "margin-left", w - h/2 + 10 );
        $h.css( "margin-top", (h/2 + 10) * -1 );
        $h.text( h );
        $w.width( w );
        $w.text( w );
    });
    Etsy.coords.top = $c.offset().top;
    Etsy.coords.left = $c.offset().left;

    // enhance elements
    $( ".tool-placable" ).draggable({
        helper: "clone",
        revert: true,
        revertDuration: 1
    });
    $c.droppable({
        drop: _drop
    });
    $add.on( "click", function( e ) {
        $( this ).find( "ul" ).show();
        return false;
    });
    $add.on( "blur", "input", function( e ) {
        var $t = $( this );
        _addObject( $t.prop( "id" ), $t.val() );
        $t.val( "" );
        $t.closest( "ul" ).hide();
    });
    $( ".toolbox" ).on( "click", ".api-object", function( e ) {
        var $t = $( this );
        $t.find( ".object-data" ).show();
        $t.find( ".object-data a" ).draggable({
            helper: "clone",
            revert: true,
            revertDuration: 1
        });
    });

    // wire up events
    $c
        .on( "click", "span.text-edit", function( e ) {
            $( this ).focus();
        })
        .on( "mouseout", function( e ) {
            $prev.width( $c.width() );
            $prev.height( $c.height() );
            _update();
        });

    function _addObject( id, value ) {
        if ( value.length ) {
            var type = id.replace( "txt", "" ).replace( "Id", "" ),
                el = $( '<a class="api-object">' + type + ':' + value + '</a>' ),
                data = '<span class="object-data">' + Etsy.tmpls[ type ] + '</span>';
            $add.before( el );
            el.append( data );
            el.find( "a" ).prop( "data-type", type );
            // fetch object for preview/verification
            var path = type.toLowerCase() + "s/" + value + ".js",
                params = "&callback=Etsy.addObject";
            $.get( "http://openapi.etsy.com/v2/" + path + apikey + params, Etsy.addObject, "script" );
            
            if ( type == "Listing" ) {
                $.get( "http://openapi.etsy.com/v2/listings/" + value + "/images.js" + apikey + params, Etsy.addObject, "script" );
                el.find( "span.object-data" ).append( Etsy.tmpls[ "ListingImage" ] );
            }
        }
    }

    function _drop( e, ui ) {
        if ( ui.draggable.closest( ".container" ).length ) {
            ui.draggable
                .css( "top", ( ui.offset.top - Etsy.coords.top ) )
                .css( "left", ( ui.offset.left - Etsy.coords.left ) );
            _update();
            return;
        }

        var id = ui.draggable.prop( "id" ),
            el;

        if ( id ) {
            el = $( Etsy.tmpls[ id ] );
        } else {
            if ( ui.draggable.hasClass( "api-text" ) ) {
                el = $( '<div class="text">{{=it.' + ui.draggable.prop( "data-type" ) + "." + ui.draggable.text() + '}}</div>' );
            } else if ( ui.draggable.hasClass( "api-image" ) ) {
                el = $( '<img src="{{=it.' + ( ui.draggable.prop( "data-type" ) || "ListingImage" ) + "." + ui.draggable.text() + '}}" />' );
            }
            $( ".object-data" ).hide();
        }

        switch ( id ) {
            case "tool-container":
                el.droppable( { drop: _drop } );
                $( e.target ).append( el );
                break;
            case "tool-text":
                $( e.target ).append( el );
                break;
            default: 
                $( e.target ).append( el );
        }
        
        el
            .draggable( { containment: "parent" } )
            .css( "top", ( ui.offset.top - Etsy.coords.top ) )
            .css( "left", ( ui.offset.left - Etsy.coords.left ) );

        _update();
        return false;
    }

    function _update() {
        $prev.html( doT.template( $c.html() )( objects ) );
    }

    Etsy.addObject = function ( data ) {
        if ( !data ) return;
        objects[ data.type ] = data.results[0];
    }

})( Etsy );