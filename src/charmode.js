function character_pixel(chargen, charidx, x, y) {
    var charbase = charidx * 8
    var rowbase  = charbase + y
    var pix      = (chargen[rowbase] & (1 << (7 - x)))
    return pix != 0
}

function create_table(id, w, h, content) {
    content = content || function() { return "<div></div>" }

    var html = '<table id="' + id + '" class="pixel" onmousedown="tile_on_down(this)" onmouseup="tile_on_up(this)" onmousemove="tile_on_move(this)">'
    for (var y = 0; y < h; y++) {
        html += '<tr>'
        for (var x = 0; x < w; x++) {
            html += '<td>' + content(x, y) + '</td>'
        }
        html += '</tr>'
    }
    html += "</table>"

    return html
}

function query_pixel(id, x, y) {
    return document.getElementById(id).getElementsByTagName("tr")[y].getElementsByTagName("td")[x]
}

function pixel_color(id, x, y, color) {
    query_pixel(id, x, y).style.background = color
}

function draw_char(char_css_id, chargen, charidx) {
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            pixel_color(char_css_id, x, y, character_pixel(chargen, charidx, x, y) ? "black" : "white")
        }
    }
}

function screenpos_cssid(screen_id, charx, chary) {
    return screen_id + "-" + charx + "-" + chary
}

function draw_screen(screen_id, chargen, content) {
    for (var y = 0; y < 25; y++) {
        for (var x = 0; x < 40; x++) {
            draw_char(screenpos_cssid(screen_id, x, y), chargen, content[x][y])
        }
    }
}

var all_callbacks = {
    down: {},
    move: {},
    up:   {},
}

function tile_do_cb(element, type) {
    var matches = /(\w+)-(\d+)-(\d+)/.exec(element.id)
    if (!matches)
        return

    var thing = matches[1]
    var x = parseInt(matches[2])
    var y = parseInt(matches[3])

    var cb = all_callbacks[type][thing]
    if (cb)
        cb(x, y)
}

function tile_on_down(el) { tile_do_cb(el, 'down') }
function tile_on_move(el) { tile_do_cb(el, 'move') }
function tile_on_up(el)   { tile_do_cb(el, 'up')   }

function screen_to_b64(screen_content) {
    var data = []

    for (var y = 0; y < 25; y++) {
        for (var x = 0; x < 40; x++) {
            data += String.fromCharCode(screen_content[x][y])
        }
    }

    return window.btoa(data)
}

function share_link() {
    var loc = location.href.replace(location.hash,"")
    loc = loc + '#' + screen_to_b64(screen_content)
    alert(loc)
}

function create_prg() {
    var c64_program = window.atob('AQgMCAoAniAyMDYyAAAAogC9LwidAAS9LwmdAAW9LwqdAAa9LwudAAfo0OUgz/9g')
    
    for (var y = 0; y < 25; y++) {
        for (var x = 0; x < 40; x++) {
            c64_program += String.fromCharCode(screen_content[x][y])
        }
    }

    alert(window.btoa(c64_program))
}

/* -- */

var screen_content = []

function main() {
    var char_size =    { w:  8, h: 8 }
    var palette_size = { w: 16, h: (32 / 2) }

    /* Creating elements */

    document.write("<h1>Character Mode</h1>")
    document.write("<table><tr><td>Screen area:")

    document.write(create_table("screen", 40, 25, function(x, y) {
        return create_table('screen-' + x + '-' + y, char_size.w, char_size.h)
    }))

    document.write('<br><a class="action" href="javascript:share_link()">Get share link</a>')
    document.write('<br><a class="action" href="javascript:create_prg()">Create PRG</a>')
    document.write("</td><td class='spacer'> </td><td>Character palette:<br>")

    document.write(create_table("palette", palette_size.w, palette_size.h, function(x, y) {
        return create_table('palette-' + x + '-' + y, char_size.w, char_size.h)
    }))

    document.write("<br><br>Selected char: ")
    document.write(create_table('selected-char', char_size.w, char_size.h))
    document.write("</td></tr></table>")

    /* Initialization */

    for (var x = 0; x < 40; x++) {
        screen_content[x] = []
        for (var y = 0; y < 25; y++) {
            screen_content[x][y] = 0
        }
    }

    /* Get content from url, hackishly */

    if (location.hash) {
        var str = window.atob(location.hash.substring(1))

        if (str) {        
            for (var i = 0; i < str.length; i++) {
                var x = i % 40
                var y = Math.floor(i / 40)

                screen_content[x][y] = str.charCodeAt(i)
            }
        }
    }

    /* Fill in the character palette */

    var c = 0
    for (var y = 0; y < palette_size.h; y++) {
        for (var x = 0; x < palette_size.w; x++) {
            draw_char(screenpos_cssid("palette", x, y), chargen, c++)
        }
    }

    draw_screen("screen", chargen, screen_content)

    var selected_char = 0
    var set_selected = function(newchar) {
        selected_char = newchar
        draw_char('selected-char', chargen, selected_char)
    }

    set_selected(0)

    var paint_screen = function(x, y) {
        screen_content[x][y] = selected_char
        draw_char(screenpos_cssid("screen", x, y), chargen, screen_content[x][y])
    }

    /* Callbacks for character palette */

    all_callbacks['up']['palette'] = function(x, y) {
        set_selected(y * 16 + x)
    }

    /* Callbacks for screen area */

    var screen_down_x = -1
    var screen_down_y = -1

    all_callbacks['down']['screen'] = function(x, y) {
        screen_down_x = x
        screen_down_y = y

        paint_screen(x, y)
    }

    all_callbacks['move']['screen'] = function(x, y) {
        if (screen_down_x == -1 && screen_down_y == -1)
            return

        if (screen_down_x == x && screen_down_y == y)
            return

        screen_down_x = x
        screen_down_y = y

        paint_screen(x, y)
    }

    all_callbacks['up']['screen'] = function(x, y) {
        screen_down_x = -1
        screen_down_y = -1

        if (screen_down_x != x || screen_down_y != y)
            paint_screen(x, y)
    }
}

main()
