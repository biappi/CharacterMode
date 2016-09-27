function character_pixel(chargen, charidx, x, y) {
    var charbase = charidx * 8
    var rowbase  = charbase + y
    var pix      = (chargen[rowbase] & (1 << (7 - x)))
    return pix != 0
}

function create_table(id, w, h, content) {
    content = content || function() { return "<div></div>" }

    var html = '<table id="' + id + '" class="pixel" onclick="tile_on_click(this)">'
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

var all_callbacks = {}
function tile_on_click(element) {
    var matches = /(\w+)-(\d+)-(\d+)/.exec(element.id)
    if (!matches)
        return

    var thing = matches[1]
    var x = parseInt(matches[2])
    var y = parseInt(matches[3])

    var cb = all_callbacks[thing]
    if (cb)
        cb(x, y)
}

function main() {
    var screen_content = []
    for (var x = 0; x < 40; x++) {
        screen_content[x] = []
        for (var y = 0; y < 25; y++) {
            screen_content[x][y] = 0
        }
    }

    var char_size =    { w:  8, h: 8 }
    var palette_size = { w: 16, h: (32 / 2) }

    document.write("<table><tr><td>")

    document.write(create_table("screen", 40, 25, function(x, y) {
        return create_table('screen-' + x + '-' + y, char_size.w, char_size.h)
    }))

    document.write("</td><td class='spacer'> </td><td>")

    document.write(create_table("palette", palette_size.w, palette_size.h, function(x, y) {
        return create_table('palette-' + x + '-' + y, char_size.w, char_size.h)
    }))

    document.write("<br><br>Selected char: ")
    document.write(create_table('selected-char', char_size.w, char_size.h))
    document.write("</td></tr></table>")

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

    all_callbacks['palette'] = function(x, y) {
        set_selected(y * 16 + x)
    }

    all_callbacks['screen'] = function(x, y) {
        screen_content[x][y] = selected_char
        draw_char(screenpos_cssid("screen", x, y), chargen, screen_content[x][y])
    }
}

main()
