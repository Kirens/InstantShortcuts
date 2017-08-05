const lang = {
    arrow_instructions: "Use the up and down arrow keys to select each result. Press Enter to go to the selection."
};
const ptrCls = "keybord-pointer",
      lnkCls = "keyboard-link";

var getStyle = function(el, prop) {
    return getComputedStyle(el, null)[prop];
};
var isTextRTL = ()=> getStyle(document.body || document.documentElement, "direction") == "rtl";

var addClass = (el,cls)=>el.classList && el.classList.add(cls);

var getLinkEl = function(el) {
    var retEl = el;
    if (retEl.nodeName != 'A') {
        var ls = el.querySelectorAll("a.l");

        if (ls.length == 1) retEl = ls[0];
        else retEl = el.querySelector("a:not(:empty)");
    }
    return retEl || el.querySelector("a");
};

var findClassEl = function(el, clsNm) {
    if(!el) return null;
    do {
        if (el.classList && el.classList.contains(clsNm))
            return el;
    } while(el = el.parentNode)
    return null
};

var fromId = id=>document.getElementById(id);

var createPointer = function(){
    pointer = document.createElement('span');
    pointer.innerHTML = isTextRTL() ? "&#9668;" : "&#9658;";
    pointer.id = ptrCls;
    pointer.title = lang.arrow_instructions;
    return pointer;
};

var stepSelect = function(direction, base) {
    direction = +direction || 0;

    if(document.getElementById("center_col").parentNode.classList.contains("fade")) return;

    var links = [];

    // Itterate through all top-level blocks to find potential links
    [[".ads-ad", "taw"], ["div.e", "topstuff"], [".g", "res"], [".ads-ad", "bottomads"], ["a.pn", "nav"], [".ads-ad", "rhs_block"], ["a", "rhs_block"]]
    // Turn ids into elements
        .map(([_,id])=>[_,fromId(id)])
    // Remove all not found
        .filter(([_,el])=>el)
    // Add link and possibly sublinks
        .map(([selector, el])=>{
            Array.from(el.querySelectorAll(selector)).map(link=>{
                [link].concat(Array.from(link.querySelectorAll("div." + ("lclbox" == link.id ? "intrlu" : "sld"))))
                // Remove all non-links
                    .filter(lnk=>el.nodeName == 'A' || el.querySelector("a"))
                // Append and add class
                    .map(lnk=>links.push(lnk) && lnk.classList.add(lnkCls));
            });
    });
    var lastActive = findClassEl(document.activeElement, lnkCls) || findClassEl(fromId(ptrCls), lnkCls);
    var i = +base || 0;
    if (typeof base == 'undefined' && lastActive) i = links.indexOf(lastActive) + direction;

    // Find the next valid link in given direction
    while (0 <= i && i < links.length) {
        let lnkEl = getLinkEl(links[i]);
        if (links[i].offsetHeight > 0
            && getStyle(lnkEl, 'visibility') != 'hidden'
            && findClassEl(lnkEl, lnkCls) == links[i]) break;
        i += direction || 1;
    }

    // If valid link was found, create or move pointer
    if (links[i]) {
        let pointer = fromId(ptrCls) || createPointer();
        pointer.style.paddingTop = getStyle(links[i], "padding-top");
        links[i].appendChild(pointer);

        var lnkEL = getLinkEl(links[i]);
        lnkEL.style.outline = "none";
        lnkEL.focus();
    }
};
var unselect = ()=>{
    var ptr = fromId(ptrCls);
    ptr && ptr.parentElement && ptr.parentElement.removeChild(ptr);
}
var searchBox, getSearchBox = ()=>{return searchBox || (searchBox = Array.from(document.getElementsByName('q')).filter(e=>e.type=='text')[0])};
var serchCaret = ()=>{
    var searchBox = getSearchBox();
    searchBox.focus();
    searchBox.setSelectionRange(searchBox.value.length, searchBox.value.length);
    document.body.scrollTop = 0;
};

addEventListener('keydown', e=>{
    console.info('Active', document.activeElement);

    var preventDefault = false, lnkActive;
    if(e.key == 'Tab'){
        if([document.body, getSearchBox()].indexOf(document.activeElement) != -1){
            stepSelect(0, 0);
            preventDefault = true;
        } else {
            unselect();
        }
    }else if(lnkActive = findClassEl(document.activeElement, lnkCls) || document.activeElement == document.body) {
        preventDefault = true;
        switch(e.key){
            case 'ArrowDown':
                if(fromId(ptrCls) || lnkActive) stepSelect(1);
                break;
            case 'ArrowUp':
                if(fromId(ptrCls) || lnkActive) stepSelect(-1);
                break;
            case 'Escape':
                // Select search
                getSearchBox().select();
                document.body.scrollTop = 0;
                unselect();
                break;
            case 'Backspace':
                serchCaret();
                unselect();
                break;
            default:
                preventDefault = false;
        }
    }
    if(preventDefault) e.preventDefault();
});

addEventListener('load', serchCaret);

console.log(1);
