import React from 'react';
import ReactDOM from 'react-dom/client';

var __read = function (iterable, count) {
    var result = [];
    var iterator = iterable[Symbol.iterator]();

    for (var i = 0; (count === undefined || i < count); i++) {
        var item = iterator.next();
        if (item.done) {
            break;
        }
        result.push(item.value);
    }
    return result;
};

var GAL_BG = "gal-bg";
var Line = function (lineProps) {
    var str = lineProps.str;
    var defaultSpeed = lineProps.speed;
    var speed = defaultSpeed === void 0 ? 100 : defaultSpeed;
    var handleNext = lineProps.onNext;
    var onNext = handleNext === void 0 ? function () {} : handleNext;
    var skip = lineProps.skip;
    var shouldWait = lineProps.wait;
    var wait = shouldWait === void 0 ? true : shouldWait;

    if (skip){
        return React.createElement('span', null, str, React.createElement('br', null));
    }
    if (wait){
        return React.createElement(React.Fragment, null);
    }

    var [state, setState] = React.useState(0);
    var ref = React.useRef(0);
    var click = function () { 
        return state < str.length ? setState(str.length) : onNext(); 
    };

    React.useEffect(function () {
        if (state < str.length) {
            ref.current = setTimeout(function () { return setState(state + 1); }, speed);
        }
        var container = document.getElementById(GAL_BG);
        container.onclick = click;
        return function () {
            clearTimeout(ref.current);
            container.onclick = null;
        };
    }, [state]);

    return React.createElement(React.Fragment, null, str.slice(0, state));
};

var Lines = React.forwardRef(function (linesProps, ref) {
    var lines = linesProps.lines;
    var onNext = linesProps.onNext;
    var init = linesProps.init ?? 0;
    var speed = linesProps.speed;
    var speaker = linesProps.speak[0];
    var [state, setState] = React.useState(init);

    var nextStep = function () {
        if (state < lines.length - 1) {
            setState(state + 1);
        }
        else {
            var hasNext = onNext();
            hasNext && setState(0);
        }
    };

    React.useImperativeHandle(ref, function () {
        return ({
            getLine: function () { return state; }
        });
    });

    return React.createElement('div', { className: "dialog-box" },
        // React.createElement("img", { className: "character-image", src: "character.png", alt: "Character" }),
        React.createElement('div', { className: "dialog-text" },
        React.createElement('span', { style: {fontSize: "25px"} }, speaker, React.createElement('br', null)),
        lines.map(function (line, index) {
            return React.createElement(
                Line,
                { key: line, skip: index < state, str: line, speed: speed, wait: state !== index, onNext: nextStep }
            );
        }),
        React.createElement('span', { className: "cursor" })
    ),
);
});

var BG_Picture = function (bg) {
    var src = bg.src;
    return React.createElement('picture', { style: {
            backgroundImage: "url(" + src + ")",
            // opacity: 0.5,
            width: "100%",
            height: "100%",
            position: "fixed",
            zIndex: -1,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.6)"
        }
    });
};


var CharStat = function () {
    return React.createElement('div', { className: "player-status", style: {
                position: "fixed",
                top: "10px",
                left: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: "5px"
            }
        }
    );
};

var Gal = React.forwardRef(function (screenConfig, thisRef) {
    var { pages, end, speed, initLine: initLineDefault, initPage: initPageDefault, start: galStart } = screenConfig;
    var initLine = initLineDefault === undefined ? 0 : initLineDefault;
    var initPage = initPageDefault === undefined ? 0 : initPageDefault;
    var [state, setState] = React.useState(initPage);
    var currentPage = pages[state];
    var { lines, bg, char, speaker: char_speak, music, charStat } = currentPage;

    var ref = React.useRef();
    var music_ref = React.useRef();

    React.useImperativeHandle(thisRef, function () { 
        return ({
            getLine: function () { return ref.current.getLine(); },
            getPage: function () { return state; }
        }); 
    });
    
    return React.createElement('div', { id: GAL_BG, style: { userSelect: "none" } },
        bg && React.createElement(BG_Picture, { src: bg }),
        React.createElement(Lines, { speed: speed, init: initLine, ref: ref, lines: lines, speak: char_speak,
            onNext: function () {
                var hasNext = state < pages.length - 1;
                if (hasNext) {
                    setState(state + 1);
                }
                else {
                    end && end();
                }
                return hasNext;
            } 
        })
    )
});

var Select = function (selectOptions) {
    var selects = selectOptions.selects;
    var onSelect = selectOptions.onSelect;

    return React.createElement('div', { className: "select-btn-container" },
        React.createElement('div', { className: "select-btn-group" },
            Object.keys(selects).map(
                function (title, index) {
                    return React.createElement('button', { className: "select-button", key: title, 
                        onClick: function () {
                            return onSelect(selects[title].join); 
                        } },
                        title
                    );
                }
            )
        )
    );
};

var Galgame = React.forwardRef(function (initProps, thisRef) {
    var Scenes = initProps.Scenes;
    var selects = initProps.selects;
    var end = initProps.end;
    var initLine = initProps.initLine;
    var initPage = initProps.initPage;
    var initPara = initProps.initPara;
    var speed = initProps.speed;

    var createSelect = function (page) {
        var SelectNode = React.createElement(Select, { 
            selects: selects[page],
            onSelect: function (target) {
                return setDisplay(React.createElement(IndexPage, { page: target }));
            }
        });

        // var container = document.createElement('div', null);
        // ReactDOM_r.render(SelectNode, container);
        
        // var rootElement = document.getElementById('root');
        // rootElement.appendChild(container);

        return SelectNode;
    };

    var IndexPage = function (pageInfo) {
        var page = pageInfo.page;
        var ref = React.useRef();
        var gameStart = !Boolean(page === Object.keys(Scenes)[0]);

        React.useImperativeHandle(thisRef, function () { return ({
            getLine: function () { return ref.current.getLine(); },
            getPage: function () { return ref.current.getPage(); },
            getPara: function () { return page; }
        }); });
        
        return React.createElement(Gal, { speed: speed, initLine: initLine, initPage: initPage, ref: ref, pages: Scenes[page], start: gameStart,
            end: function () {
                if (page in selects) {
                    setDisplay(createSelect(page));
                }
                else {
                    end && end();
                }
            }}
        );
    };

    var currentPage = React.createElement(IndexPage, { page: initPara || Object.keys(Scenes)[0] });
    var [display, setDisplay] = __read(React.useState(currentPage), 2);
    
    return display;
});

var KEYS = {
    GAL_PARA: "GAL_PARA",
    GAL_PAGE: "GAL_PAGE",
    GAL_LINE: "GAL_LINE",
    GAL_SPEED: "GAL_SPEED"
};

var App = function (data) {
    var jsonData = data.jsonData;
    var Scenes = jsonData.Scenes;
    var selects = jsonData.selects;
    var ref = React.useRef();

    return React.createElement(React.Fragment, null,
        React.createElement(Galgame, { initPara: localStorage.getItem(KEYS.GAL_PARA), initPage: Number(localStorage.getItem(KEYS.GAL_PAGE)), initLine: Number(localStorage.getItem(KEYS.GAL_LINE)), ref: ref, Scenes: Scenes, selects: selects,
            end: function () {
                if (window.confirm("Do you need to start over?")) {
                    window.location.reload();
                }
            }}
        )
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(App, { jsonData: require("../src/data.json") })
);