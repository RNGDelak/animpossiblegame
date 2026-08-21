// expose the requestrender func

var renderer = (() => {
    var canvas;
    var ctx;
    var outimg;
    var cursorstr = "▮";
    var cursorendstr = "▯";
    var lineBreakRegex = /\r?\n/g;
    var itemSeparatorRegex = /[\t ,]/g;

    var _STACKMODE = document.getElementById("STACKMODE");
    var _HIGHLIGHT = document.getElementById("HIGHLIGHT");
    var _EXTRADIVIDER = document.getElementById("EXTRADIVIDER");

    window.addEventListener("load", function () {
        canvas = document.getElementById("output");
        ctx = canvas.getContext("2d");
        outimg = document.getElementById("outimg");
        load();
        requestDraw(true);
        drawIntervalLoopFunc();

        setInterval(() => {
            if (hasRequestedDraw) processDrawRequest();
        }, 16); // not 0
    });

    function drawIntervalLoopFunc() {
        requestDraw(true);
        setTimeout(drawIntervalLoopFunc, 0);
    }
    var hasRequestedDraw = false;
    var hasRequestedRecalculation = false;
    function requestDraw(recalculate) {
        hasRequestedRecalculation = hasRequestedRecalculation || recalculate;
        hasRequestedDraw = true;
    }
    function processDrawRequest() {
        if (page != 3) return;
        try {
            draw(hasRequestedRecalculation);
        } catch (e) {
            throw e;
        }
        hasRequestedDraw = false;
        hasRequestedRecalculation = false;
    }
    var calculatedMountain = null;
    function parseSequenceElement(s, i) {
        var strremoved = s;
        if (strremoved.indexOf(cursorstr) != -1) {
            strremoved = strremoved.substring(0, strremoved.indexOf(cursorstr)) + strremoved.substring(strremoved.indexOf(cursorstr) + 1);
        }
        if (strremoved.indexOf(cursorendstr) != -1) {
            strremoved = strremoved.substring(0, strremoved.indexOf(cursorendstr)) + strremoved.substring(strremoved.indexOf(cursorendstr) + 1);
        }
        if (strremoved.indexOf("v") == -1 || !isFinite(Number(strremoved.substring(strremoved.indexOf("v") + 1)))) {
            var numval = Number(strremoved);
            return {
                value: numval,
                strexp: getstrexp(s, strremoved),
                position: i,
                parentIndex: -1
            };
        } else {
            return {
                value: Number(strremoved.substring(0, strremoved.indexOf("v"))),
                strexp: getstrexp(s, strremoved),
                position: i,
                parentIndex: Math.max(Math.min(i - 1, Number(strremoved.substring(strremoved.indexOf("v") + 1))), -1),
                forcedParent: true
            };
        }
    }
    function parseSequenceString(s) {
        return s.split(itemSeparatorRegex).map(parseSequenceElement);
    }
    function equalVector(s, t, d) {
        if (d === undefined) d = 0;
        for (var i = d, l = Math.max(s.length, t.length); i < l; i++) {
            if ((s[i] || 0) != (t[i] || 0)) return false;
        }
        return true;
    }
    function addVector(s, t) {
        var r = [];
        for (var i = 0, l = Math.max(s.length, t.length); i < l; i++) {
            r.push((s[i] || 0) + (t[i] || 0));
        }
        return r;
    }
    function stBasis(d) {
        var r = [];
        while (r.length < d) r.push(0);
        r.push(1);
        return r;
    }
    function basis(d, k) {
        var r = [];
        while (r.length < d) r.push(0);
        r.push(k);
        return r;
    }
    function incrementCoord(s, d) {
        var r = s.slice(0);
        for (var i = 0; i < d; i++) r[i] = 0;
        return addVector(r, stBasis(d));
    }
    function addCoord(s, d, k) {
        var r = s.slice(0);
        for (var i = 0; i < d; i++) r[i] = 0;
        return addVector(r, basis(d, k));
    }
    function sumArray(s) {
        var r = 0;
        for (var i = 0; i < s.length; i++) r += s[i];
        return r;
    }
    function calcMountain(s, maxDim) {
        if (maxDim === undefined) maxDim = Infinity;
        var coordOffset = typeof s == "object" ? s.coord : [];
        if (typeof s == "string") s = parseSequenceString(s);
        if (s instanceof Array && s.length <= 1) {
            return {
                dim: 1,
                arr: [{
                    dim: 0,
                    value: s[0].value,
                    strexp: s[0].strexp,
                    position: s[0].position,
                    coord: coordOffset.slice(0),
                    parentIndex: s[0].parentIndex,
                    forcedParent: s[0].forcedParent,
                    leftLegCoord: null,
                    rightLegCoord: null
                }],
                coord: coordOffset.slice(0)
            };
        } else if (!(s instanceof Array) && s.arr.length <= 1) {
            return s.arr[0];
        } else {
            var m;
            if (s instanceof Array) {
                m = {
                    dim: 1,
                    arr: [],
                    coord: coordOffset.slice(0)
                };
                for (var i = 0; i < s.length; i++) {
                    m.arr.push({
                        dim: 0,
                        value: s[i].value,
                        strexp: s[i].strexp,
                        position: s[i].position,
                        coord: addCoord(coordOffset, 0, i),
                        parentIndex: s[i].parentIndex,
                        forcedParent: s[i].forcedParent,
                        leftLegCoord: null,
                        rightLegCoord: null
                    });
                    if (!s[i].forcedParent) {
                        for (var j = i; j >= 0; j--) {
                            if (s[j].value < s[i].value) {
                                m.arr[i].parentIndex = j;
                                break;
                            }
                        }
                    }
                }
            } else {
                m = s;
            }
            var lastPosition = sumArray(m.arr[m.arr.length - 1].coord);
            var dimensions = 1;
            while (dimensions <= maxDim) {
                var uppers = calcDifference(m);
                if (uppers.arr.length < 1) break;
                var upperm = calcMountain(uppers, dimensions);
                var upperdim = upperm.dim;
                var raisedupperm = upperm;
                while (raisedupperm.dim <= dimensions) {
                    raisedupperm = {
                        dim: raisedupperm.dim + 1,
                        arr: [raisedupperm],
                        coord: raisedupperm.coord.slice(0)
                    };
                }
                raisedupperm.coord = coordOffset.slice(0);
                raisedupperm.arr.unshift(m);
                m = raisedupperm;
                dimensions++;
            }
            return m;
        }
    }
    function calcDifference(m) {
        var coordOffset = incrementCoord(m.coord, m.dim);
        var rightLegs = [];
        var rightLegTree = [];
        var rightLegPositions = [];
        if (m.dim == 1) {
            for (var i = 0; i < m.arr.length; i++) {
                rightLegs.push(m.arr[i]);
                rightLegTree.push(m.arr[i].parentIndex);
                rightLegPositions.push(sumArray(m.arr[i].coord));
            }
        } else {
            for (var i = 0; i <= getLastPosition(m); i++) {
                var node = findHighestWithPosition(m, i);
                if (node) rightLegPositions.push(i);
            }
            for (var i = 0; i < rightLegPositions.length; i++) {
                var node = findHighestWithPosition(m, rightLegPositions[i]);
                rightLegs.push(node);
                var pn = node;
                while (pn) {
                    var ppn = parent(m, pn);
                    if (!ppn) ppn = leftLeg(m, pn);
                    if (!ppn) {
                        rightLegTree.push(-1);
                        break;
                    }
                    pn = ppn;
                    if (pn.parentIndex == -1 && rightLegPositions.indexOf(sumArray(pn.coord)) != -1) {
                        rightLegTree.push(rightLegPositions.indexOf(sumArray(pn.coord)));
                        break;
                    }
                }
                if (!pn) rightLegTree.push(-1);
            }
        }
        var rightLegInR = [];
        var rInRightLeg = [];
        var rightLegParents = [];
        var r = {
            dim: 1,
            arr: [],
            coord: coordOffset
        };
        for (var i = 0; i < rightLegs.length; i++) {
            var pi = i;
            while (pi > -1 && !(rightLegs[pi].value < rightLegs[i].value && (rightLegs[pi].coord[m.dim - 1] || 0) < (rightLegs[i].coord[m.dim - 1] || 0))) pi = rightLegTree[pi];
            rightLegParents.push(pi);
            if (pi != -1) {
                rightLegInR.push(r.arr.length);
                rInRightLeg.push(i);
                r.arr.push({
                    dim: 0,
                    value: rightLegs[i].value - rightLegs[pi].value,
                    position: rightLegPositions[i],
                    coord: addCoord(coordOffset, 0, rightLegPositions[i] - sumArray(coordOffset)),
                    parentIndex: -1,
                    forcedParent: true,
                    leftLegCoord: rightLegs[pi].coord.slice(0),
                    rightLegCoord: rightLegs[i].coord.slice(0)
                });
            } else {
                rightLegInR.push(-1);
            }
        }
        for (var i = 0; i < r.arr.length; i++) {
            var pi = rInRightLeg[i];
            while (true) {
                var ppi = rightLegParents[pi];
                if (ppi == -1 || rightLegInR[ppi] == -1) break;
                pi = ppi;
                if (r.arr[rightLegInR[pi]].value < r.arr[i].value) {
                    r.arr[i].parentIndex = rightLegInR[pi];
                    break;
                }
            }
        }
        return r;
    }
    function indexFromCoord(m, coord, d) {
        if (d === undefined) d = 0;
        var r = [];
        while (true) {
            if (m.dim <= d) {
                if (equalVector(m.coord, coord, d)) return r;
                else return null;
            }
            if (m.dim == 1) {
                for (var i = 0; i < m.arr.length + 1; i++) {
                    if (i == m.arr.length) return null;
                    if ((m.arr[i].coord[0] || 0) == (coord[0] || 0)) {
                        r.push(i);
                        m = m.arr[i];
                        break;
                    }
                }
            } else {
                var i = coord[m.dim - 1] || 0;
                if (i >= m.arr.length) return null;
                r.push(i);
                m = m.arr[i];
            }
        }
    }
    function findByIndex(m, index) {
        if (!index) return null;
        for (var i = 0; i < index.length; i++) m = m.arr[index[i] < 0 ? m.arr.length + index[i] : index[i]];
        return m;
    }
    function findByCoord(m, coord, d) {
        return findByIndex(m, indexFromCoord(m, coord, d));
    }
    function getLastPosition(m) {
        while (m.dim > 1) m = m.arr[0];
        return m.arr[m.arr.length - 1].position;
    }
    function findHighestWithPosition(m, position) {
        if (m.dim == 0) {
            if (m.position == position) return m;
            else null;
        } else {
            if (m.arr.length === 0) return null;
            if (m.dim == 1) {
                var min = 0;
                var max = m.arr.length - 1;
                if (m.arr[min].position > position || m.arr[max].position < position) return null;
                if (m.arr[min].position == position) return m.arr[min];
                if (m.arr[max].position == position) return m.arr[max];
                while (min != max) {
                    var mid = Math.floor((min + max) / 2);
                    if (m.arr[mid].position == position) return m.arr[mid];
                    else if (min == mid) return null;
                    else if (m.arr[mid].position < position) min = mid;
                    else if (m.arr[mid].position > position) max = mid;
                }
                return null;
            } else {
                for (var i = m.arr.length - 1; i >= 0; i--) {
                    var lowestRow = m.arr[i];
                    while (lowestRow && lowestRow.dim > 1) lowestRow = lowestRow.arr[0];
                    if (!lowestRow) continue;
                    var nodeInLowestRow = findHighestWithPosition(lowestRow, position);
                    if (nodeInLowestRow) {
                        if (m.dim == 2) return nodeInLowestRow;
                        else return findHighestWithPosition(m.arr[i], position);
                    }
                }
                return null;
            }
        }
    }
    function parent(m, node) {
        if (node.dim != 0 || node.parentIndex == -1) return null;
        var index = indexFromCoord(m, node.coord);
        if (!index) return null;
        index[index.length - 1] = node.parentIndex;
        return findByIndex(m, index);
    }
    function leftLeg(m, node) {
        if (node.dim != 0 || !node.leftLegCoord) return null;
        return findByCoord(m, node.leftLegCoord);
    }
    function rightLeg(m, node) {
        if (node.dim != 0 || !node.rightLegCoord) return null;
        return findByCoord(m, node.rightLegCoord);
    }
    function flattenMountain(m) {
        var r = {};
        if (m.dim == 0) {
            r[m.coord.join(",")] = m;
        } else {
            for (var i = 0; i < m.arr.length; i++) {
                Object.assign(r, flattenMountain(m.arr[i]));
            }
        }
        return r;
    }
    function getstrexp(s, strremoved) {
        if (typeof strremoved == "undefined") {
            strremoved = s;
            if (strremoved.indexOf(cursorstr) != -1) {
                strremoved = strremoved.substring(0, strremoved.indexOf(cursorstr)) + strremoved.substring(strremoved.indexOf(cursorstr) + 1);
            }
            if (strremoved.indexOf(cursorendstr) != -1) {
                strremoved = strremoved.substring(0, strremoved.indexOf(cursorendstr)) + strremoved.substring(strremoved.indexOf(cursorendstr) + 1);
            }
        }
        if (strremoved.indexOf("v") == -1 || !isFinite(Number(strremoved.substring(strremoved.indexOf("v") + 1)))) {
            return s;
        } else {
            if (s.indexOf(cursorstr) != -1 && s.indexOf(cursorstr) > s.indexOf("v") || s.indexOf(cursorendstr) != -1 && s.indexOf(cursorendstr) > s.indexOf("v")) {
                return s;
            } else {
                return s.substring(0, s.indexOf("v"));
            }
        }
    }
    function updateMountainString(inputc) {
        for (var nums = inputc.split(itemSeparatorRegex), j = 0; j < nums.length; j++) {
            findByCoord(calculatedMountain, [j]).strexp = getstrexp(nums[j]);
        }
    }
    var options = ["input", "NUMBERTHICKNESS", "MAXDIMENSIONS", "STACKMODE", "HIGHLIGHT", "EXTRADIVIDER", "ROWHEIGHT", "COLUMNWIDTH", "LINETHICKNESS", "NUMBERSIZE"];
    var optionsWhichAffectMountain = ["input", "MAXDIMENSIONS"];
    var config = {
        "input": "",
        "inputc": "",
        "ROWHEIGHT": 45,
        "COLUMNWIDTH": 45,
        "LINETHICKNESS": 1,
        "NUMBERSIZE": 15,
        "NUMBERTHICKNESS": 2,
        "LINEPLACE": 1,
        "MAXDIMENSIONS": Infinity,
        "STACKMODE": true,
        "HIGHLIGHT": false,
        "DYNAMICWIDTH": true,
        "EXTRADIVIDER": false,
        "MAXWIDTH": window.innerWidth
    };
    var displayedConfig = Object.assign({}, config);
    var inputFocused = true;
    var timesDrawn = 0;
    function draw(recalculate) {
        var inputChanged = false;
        var optionChanged = false;
        var newConfig = Object.assign({}, config);
        for (var i = 0; i < options.length; i++) {
            var optionName = options[i];
            var newValue;
            var elem = document.getElementById(optionName);
            if (elem.type == "number") newValue = +elem.value;
            else if (elem.type == "text" || optionName == "input") newValue = elem.value;
            else if (elem.type == "range") newValue = +elem.value;
            else if (elem.type == "checkbox") newValue = elem.checked;
            if (config[optionName] != newValue) {
                newConfig[optionName] = newValue;
                optionChanged = true;
                if (optionsWhichAffectMountain.indexOf(optionName) != -1) inputChanged = true;
            }
            if (displayedConfig[optionName] != newValue) {
                displayedConfig[optionName] = newValue;
                if (elem.type == "range") document.getElementById(optionName + "_value").textContent = newValue + "";
            }
        }
        var sequenceInputElem = document.getElementById("input");
        var cursorPos = sequenceInputElem.selectionStart;
        var cursorEndPos = sequenceInputElem.selectionEnd;
        var highlightindex;
        var highlightendindex;
        if (!inputFocused) {
            highlightindex = 0;
            highlightendindex = 0;
            newConfig["inputc"] = newConfig["input"];
        } else {
            highlightindex = (newConfig["input"].substring(0, cursorPos).match(itemSeparatorRegex) || []).length;
            highlightendindex = (newConfig["input"].substring(0, cursorEndPos).match(itemSeparatorRegex) || []).length;
            if (cursorPos == cursorEndPos) {
                newConfig["inputc"] = newConfig["input"].substring(0, cursorPos) + cursorstr + newConfig["input"].substring(cursorPos);
            } else {
                newConfig["inputc"] = newConfig["input"].substring(0, cursorPos) + cursorstr + newConfig["input"].substring(cursorPos, cursorEndPos) + cursorendstr + newConfig["input"].substring(cursorEndPos);
            }
        }
        if (config["inputc"] != newConfig["inputc"]) optionChanged = true;
        if (!optionChanged) return;
        if (recalculate && inputChanged) calculatedMountain = calcMountain(newConfig["inputc"], newConfig["MAXDIMENSIONS"]);
        else updateMountainString(newConfig["inputc"]);
        Object.assign(config, newConfig);
        if (newConfig["STACKMODE"]) {
            var colpos = [];
            var rowpos = {};
            for (var cycles = 0; cycles < 2; cycles++) {
                var currentrow = 0;
                var renderingindex = [0];
                var mm = calculatedMountain;
                for (var i = 0; i < calculatedMountain.dim - 1; i++) {
                    renderingindex.unshift(mm.arr.length - 1);
                    mm = mm.arr[mm.arr.length - 1];
                }
                renderingindex.unshift(0);
                while (true) {
                    var mm = findByIndex(calculatedMountain, renderingindex.slice(1, -1).reverse());
                    if (cycles) {
                        render1Dmountain(calculatedMountain, mm, rowpos, colpos, newConfig);
                    } else {
                        rowpos["c" + mm.coord.slice(1).join(",")] = currentrow;
                    }
                    currentrow++;
                    for (var d = 1; d < calculatedMountain.dim; d++) {
                        renderingindex[d]--;
                        if (renderingindex[d] < 0) {
                        } else {
                            for (var dd = d - 1; dd >= 1; dd--) {
                                var mm = findByIndex(calculatedMountain, renderingindex.slice(dd + 1, -1).reverse());
                                renderingindex[dd] = mm.arr.length - 1;
                            }
                            if (newConfig["EXTRADIVIDER"] || d > 1) currentrow++;
                            if (cycles && (newConfig["EXTRADIVIDER"] || d > 1)) {
                                var lines = newConfig["EXTRADIVIDER"] ? d : d - 1;
                                ctx.beginPath();
                                for (var i = 0; i < lines; i++) {
                                    var y = currentrow * newConfig["ROWHEIGHT"] - newConfig["NUMBERSIZE"] * Math.min(newConfig["LINEPLACE"], 1) - (newConfig["ROWHEIGHT"] - newConfig["NUMBERSIZE"]) * Math.max(newConfig["LINEPLACE"] - 1, 0) - 3 + newConfig["ROWHEIGHT"] * (i + 1) / (lines + 1);
                                    ctx.moveTo(0, y);
                                    ctx.lineTo(canvas.width, y);
                                }
                                ctx.stroke();
                            }
                            break;
                        }
                    }
                    if (d >= calculatedMountain.dim) {
                        if (!cycles) {
                            var bottomrow = calculatedMountain;
                            while (bottomrow.dim > 1) bottomrow = bottomrow.arr[0];
                            ctx.font = newConfig["NUMBERTHICKNESS"] + " " + newConfig["NUMBERSIZE"] + "px Arial";

                            var currentLineWidth = 0;
                            var lineNumber = 0;
                            var maxLineWidth = 0;
                            var rowsPerLine = rowpos["c"] + 1;
                            var baseHeight = rowsPerLine * newConfig["ROWHEIGHT"];

                            for (var i = 0; i < bottomrow.arr.length; i++) {
                                var width = newConfig["DYNAMICWIDTH"] ? ctx.measureText(bottomrow.arr[i].value).width + newConfig["COLUMNWIDTH"] - 15 : newConfig["COLUMNWIDTH"];
                                if (currentLineWidth + width > newConfig["MAXWIDTH"] && currentLineWidth > 0) {
                                    currentLineWidth = 0;
                                    lineNumber++;
                                }
                                colpos.push([width, currentLineWidth, lineNumber]);
                                currentLineWidth += width;
                                if (currentLineWidth > maxLineWidth) maxLineWidth = currentLineWidth;
                            }
                            var totalLines = lineNumber + 1;
                            var finalWidth = totalLines > 1 ? newConfig["MAXWIDTH"] : maxLineWidth;
                            var totalheight = baseHeight * totalLines;
                            var dpr = window.devicePixelRatio || 1;

                            document.getElementById("outputcontainer").style.width = finalWidth + "px";
                            document.getElementById("outputcontainer").style.height = totalheight + "px";
                            canvas.width = finalWidth * dpr;
                            canvas.height = totalheight * dpr;
                            ctx.scale(dpr, dpr);

                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, finalWidth, totalheight);

                            if (newConfig["HIGHLIGHT"] && highlightindex != -1) {
                                ctx.fillStyle = "#ffaaaa";
                                ctx.fillRect(colpos[highlightindex][1], colpos[highlightindex][2] * baseHeight, colpos[highlightendindex][0] + colpos[highlightendindex][1] - colpos[highlightindex][1], baseHeight);
                            }
                            ctx.fillStyle = "black";
                            ctx.strokeStyle = "black";
                            ctx.lineWidth = newConfig["LINETHICKNESS"];
                            ctx.font = newConfig["NUMBERTHICKNESS"] + " " + newConfig["NUMBERSIZE"] + "px Arial";
                            ctx.textAlign = "center";
                        }
                        break;
                    }
                }
            }
        } else {
            var bounds = [];
            for (var i = 0; i <= Math.max(calculatedMountain.dim, 2); i++) {
                bounds.push({});
            }
            for (var cycles = 0; cycles < 2; cycles++) {
                var renderingindex = [];
                var lasts = [];
                for (var i = 0; i <= calculatedMountain.dim; i++) {
                    renderingindex.push(0);
                    lasts.push(null);
                }
                if (cycles) {
                    var totalwidth = bounds[Math.max(calculatedMountain.dim, 2)][renderingindex.slice(Math.max(calculatedMountain.dim, 2)).join(",")].r;
                    var totalheight = bounds[Math.max(calculatedMountain.dim, 2)][renderingindex.slice(Math.max(calculatedMountain.dim, 2)).join(",")].b;
                    var dpr = window.devicePixelRatio || 1;

                    document.getElementById("outputcontainer").style.width = totalwidth + "px";
                    document.getElementById("outputcontainer").style.height = totalheight + "px";
                    canvas.width = totalwidth * dpr;
                    canvas.height = totalheight * dpr;
                    ctx.scale(dpr, dpr);

                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, totalwidth, totalheight);
                    ctx.fillStyle = "black";
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = newConfig["LINETHICKNESS"];
                    ctx.font = newConfig["NUMBERTHICKNESS"] + " " + newConfig["NUMBERSIZE"] + "px Arial";
                    ctx.textAlign = "center";
                }
                while (true) {
                    var mm = findByIndex(calculatedMountain, renderingindex.slice(2, -1).reverse());
                    if (cycles) {
                        render2Dmountain(mm, bounds[2][renderingindex.slice(2).join(",")].l, bounds[2][renderingindex.slice(2).join(",")].t, newConfig);
                    } else {
                        bounds[2][renderingindex.slice(2).join(",")] = { l: 0, t: 0 };
                        for (var d = 2; d < calculatedMountain.dim; d += 2) {
                            if (lasts[d]) {
                                bounds[2][renderingindex.slice(2).join(",")].l = lasts[d].r + newConfig["COLUMNWIDTH"];
                                break;
                            }
                        }
                        for (var d = 3; d < calculatedMountain.dim; d += 2) {
                            if (lasts[d]) {
                                bounds[2][renderingindex.slice(2).join(",")].t = lasts[d].b + newConfig["ROWHEIGHT"];
                                break;
                            }
                        }
                        bounds[2][renderingindex.slice(2).join(",")].r = bounds[2][renderingindex.slice(2).join(",")].l + get2DmountainRenderedSize(mm, newConfig).x;
                        bounds[2][renderingindex.slice(2).join(",")].b = bounds[2][renderingindex.slice(2).join(",")].t + get2DmountainRenderedSize(mm, newConfig).y;
                    }
                    for (var d = 2; d < calculatedMountain.dim; d++) {
                        var mm = findByIndex(calculatedMountain, renderingindex.slice(d + 1, -1).reverse());
                        lasts[d] = bounds[d][renderingindex.slice(d).join(",")];
                        if (cycles) {
                            var lines = Math.floor(d / 2);
                            if (d % 2) {
                                ctx.beginPath();
                                for (var i = 0; i < lines; i++) {
                                    ctx.moveTo(bounds[d][renderingindex.slice(d).join(",")].l, bounds[d][renderingindex.slice(d).join(",")].b + newConfig["ROWHEIGHT"] * (i + 1) / (lines + 1));
                                    ctx.lineTo(bounds[d][renderingindex.slice(d).join(",")].r, bounds[d][renderingindex.slice(d).join(",")].b + newConfig["ROWHEIGHT"] * (i + 1) / (lines + 1));
                                }
                                ctx.stroke();
                            } else {
                                ctx.beginPath();
                                for (var i = 0; i < lines; i++) {
                                    ctx.moveTo(bounds[d][renderingindex.slice(d).join(",")].r + newConfig["COLUMNWIDTH"] * (i + 1) / (lines + 1), bounds[d][renderingindex.slice(d).join(",")].t);
                                    ctx.lineTo(bounds[d][renderingindex.slice(d).join(",")].r + newConfig["COLUMNWIDTH"] * (i + 1) / (lines + 1), bounds[d][renderingindex.slice(d).join(",")].b);
                                }
                                ctx.stroke();
                            }
                        }
                        renderingindex[d]++;
                        if (renderingindex[d] >= mm.arr.length) {
                            if (!cycles) {
                                bounds[d + 1][renderingindex.slice(d + 1).join(",")] = { l: 0, t: 0 };
                                for (var dd = (d + 1) % 2 ? d + 2 : d + 1; dd < calculatedMountain.dim; dd += 2) {
                                    if (lasts[dd]) {
                                        bounds[d + 1][renderingindex.slice(d + 1).join(",")].l = lasts[dd].r + newConfig["COLUMNWIDTH"];
                                        break;
                                    }
                                }
                                for (var dd = (d + 1) % 2 ? d + 1 : d + 2; dd < calculatedMountain.dim; dd += 2) {
                                    if (lasts[dd]) {
                                        bounds[d + 1][renderingindex.slice(d + 1).join(",")].t = lasts[dd].b + newConfig["ROWHEIGHT"];
                                        break;
                                    }
                                }
                                bounds[d + 1][renderingindex.slice(d + 1).join(",")].r = 0;
                                for (var i = 0; i < mm.arr.length; i++) {
                                    bounds[d + 1][renderingindex.slice(d + 1).join(",")].r = Math.max(bounds[d + 1][renderingindex.slice(d + 1).join(",")].r, bounds[d][i + "," + renderingindex.slice(d + 1).join(",")].r + (d + 1) % 2 * newConfig["COLUMNWIDTH"]);
                                }
                                bounds[d + 1][renderingindex.slice(d + 1).join(",")].b = 0;
                                for (var i = 0; i < mm.arr.length; i++) {
                                    bounds[d + 1][renderingindex.slice(d + 1).join(",")].b = Math.max(bounds[d + 1][renderingindex.slice(d + 1).join(",")].b, bounds[d][i + "," + renderingindex.slice(d + 1).join(",")].b + d % 2 * newConfig["ROWHEIGHT"]);
                                }
                                if (d == 2) {
                                    for (var i = 0; i < mm.arr.length; i++) {
                                        var offset = bounds[d + 1][renderingindex.slice(d + 1).join(",")].b - d % 2 * newConfig["ROWHEIGHT"] - bounds[d][i + "," + renderingindex.slice(d + 1).join(",")].b;
                                        bounds[d][i + "," + renderingindex.slice(d + 1).join(",")].t += offset;
                                        bounds[d][i + "," + renderingindex.slice(d + 1).join(",")].b += offset;
                                    }
                                }
                            }
                            renderingindex[d] = 0;
                            lasts[d] = null;
                        } else {
                            break;
                        }
                    }
                    if (d >= calculatedMountain.dim) break;
                }
            }
        }

        Object.assign(config, newConfig);
    }
    function get2DmountainRenderedSize(m, config) {
        while (m.dim < 2) {
            m = {
                dim: m.dim + 1,
                arr: [m]
            };
        }
        return {
            x: (findByIndex(m, [0, -1]).position + 1 - findByIndex(m, [0, 0]).position) * config["COLUMNWIDTH"],
            y: m.arr.length * config["ROWHEIGHT"]
        };
    }
    function findNodeByPosAndCoord(m, position, coord) {
        var flat = flattenMountain(m);
        for (var key in flat) {
            if (flat[key].position === position && flat[key].coord.join(',') === coord.join(',')) {
                return flat[key];
            }
        }
        return null;
    }

    function getNodeRelationship(node, highlightIndex, m) {
        if (highlightIndex === -1 || !node) return "none";

        var activeNode = findHighestWithPosition(m, highlightIndex);
        if (!activeNode) return "none";
        if (node.position === activeNode.position && node.coord.join(',') === activeNode.coord.join(',')) return "active";

        var curr = activeNode;
        while (curr) {
            var p = parent(m, curr) || leftLeg(m, curr);
            if (p && node.position === p.position && node.coord.join(',') === p.coord.join(',')) {
                return "ancestor";
            }
            curr = p;
        }

        curr = node;
        while (curr) {
            var p = parent(m, curr) || leftLeg(m, curr);
            if (p && activeNode.position === p.position && activeNode.coord.join(',') === activeNode.coord.join(',')) {
                return "child";
            }
            curr = p;
        }

        return "none";
    }

    function setColorByRelationship(rel, currentConfig) {
        if (currentConfig["HIGHLIGHT"] && rel === "ancestor") {
            ctx.fillStyle = "#00aa00";
            ctx.strokeStyle = "#00aa00";
            ctx.lineWidth = currentConfig["LINETHICKNESS"] * 2;
        } else if (currentConfig["HIGHLIGHT"] && rel === "child") {
            ctx.fillStyle = "#ff0000";
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = currentConfig["LINETHICKNESS"] * 2;
        } else if (currentConfig["HIGHLIGHT"] && rel === "active") {
            ctx.fillStyle = "#0000ff";
            ctx.strokeStyle = "#0000ff";
            ctx.lineWidth = currentConfig["LINETHICKNESS"] * 2;
        } else {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.lineWidth = currentConfig["LINETHICKNESS"];
        }
    }

    function render2Dmountain(m, x, y, config) {
        while (m.dim < 2) {
            m = {
                dim: m.dim + 1,
                arr: [m]
            };
        }
        var sequenceInputElem = document.getElementById("input");
        var cursorPos = sequenceInputElem.selectionStart;
        var highlightindex = (document.getElementById("input").value.substring(0, cursorPos).match(itemSeparatorRegex) || []).length;

        var leastPosition = findByIndex(m, [0, 0]).position;
        for (var j = 0; j < m.arr.length; j++) {
            var row = m.arr[j];
            for (var k = 0; k < row.arr.length; k++) {
                var point = row.arr[k];
                var currentX = x + config["COLUMNWIDTH"] * ((point.position - leastPosition) * 2 - j + 1) / 2;
                var currentY = y + config["ROWHEIGHT"] * (m.arr.length - j) - 3;

                var rel = getNodeRelationship(point, highlightindex, calculatedMountain);
                setColorByRelationship(rel, config);

                ctx.fillText(point.strexp || point.value, currentX, currentY);

                if (point.parentIndex != -1) {
                    var textTopY = currentY - config["NUMBERSIZE"] * Math.min(config["LINEPLACE"], 1) - (config["ROWHEIGHT"] - config["NUMBERSIZE"]) * Math.max(config["LINEPLACE"] - 1, 0);
                    var leftLegX = x + config["COLUMNWIDTH"] * ((point.position - leastPosition) * 2 - j) / 2;
                    var leftLegY = y + config["ROWHEIGHT"] * (m.arr.length - j - 1);
                    var parentX = x + config["COLUMNWIDTH"] * ((row.arr[point.parentIndex].position - leastPosition) * 2 - j + 1) / 2;

                    ctx.beginPath();
                    ctx.moveTo(currentX, textTopY);
                    ctx.lineTo(leftLegX, leftLegY);
                    ctx.lineTo(parentX, textTopY);
                    ctx.stroke();
                }
            }
        }
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
    }

    function render1Dmountain(m, mm, rowpos, colpos, config) {
        config.MAXWIDTH = window.innerWidth;
        while (mm.dim < 1) {
            mm = {
                dim: mm.dim + 1,
                arr: [mm]
            };
        }
        var sequenceInputElem = document.getElementById("input");
        var cursorPos = sequenceInputElem.selectionStart;
        var highlightindex = (document.getElementById("input").value.substring(0, cursorPos).match(itemSeparatorRegex) || []).length;

        var rowid = rowpos["c" + mm.coord.slice(1).join(",")];
        var baseHeight = (rowpos["c"] + 1) * config["ROWHEIGHT"];

        for (var k = 0; k < mm.arr.length; k++) {
            var point = mm.arr[k];
            var colInfo = colpos[point.position];
            var colWidth = colInfo[0];
            var colX = colInfo[1];
            var colLine = colInfo[2];
            var yOffset = colLine * baseHeight;

            var rel = getNodeRelationship(point, highlightindex, m);
            setColorByRelationship(rel, config);

            ctx.fillText(point.strexp || point.value, colX + colWidth / 2, yOffset + (rowid + 1) * config["ROWHEIGHT"] - 3);

            if (point.leftLegCoord) {
                var parentPosition = findByCoord(m, point.leftLegCoord).position;
                var parentInfo = colpos[parentPosition];
                var parentX = parentInfo[1];
                var parentLine = parentInfo[2];
                var parentYOffset = parentLine * baseHeight;

                ctx.beginPath();
                ctx.moveTo(colX + colWidth / 2, yOffset + (rowpos["c" + point.rightLegCoord.slice(1).join(",")] + 1) * config["ROWHEIGHT"] - config["NUMBERSIZE"] * Math.min(config["LINEPLACE"], 1) - (config["ROWHEIGHT"] - config["NUMBERSIZE"]) * Math.max(config["LINEPLACE"] - 1, 0) - 3);
                ctx.lineTo(colX + colWidth / 2, yOffset + (rowid + 1) * config["ROWHEIGHT"]);
                ctx.lineTo(parentX + parentInfo[0] / 2, parentYOffset + (rowid + 2) * config["ROWHEIGHT"] - config["NUMBERSIZE"] * Math.min(config["LINEPLACE"], 1) - (config["ROWHEIGHT"] - config["NUMBERSIZE"]) * Math.max(config["LINEPLACE"] - 1, 0) - 3);
                ctx.lineTo(parentX + parentInfo[0] / 2, parentYOffset + (rowpos["c" + point.leftLegCoord.slice(1).join(",")] + 1) * config["ROWHEIGHT"] - config["NUMBERSIZE"] * Math.min(config["LINEPLACE"], 1) - (config["ROWHEIGHT"] - config["NUMBERSIZE"]) * Math.max(config["LINEPLACE"] - 1, 0) - 3);
                ctx.stroke();
            }
        }
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
    }

    window.onpopstate = function (e) {
        load();
        requestDraw(true);
    }
    function load() {
        if (location.search) location.replace(location.origin + location.pathname + "#" + (location.hash || location.search).substring(1));
        var encodedState = location.hash.substring(1);
        if (!encodedState) return;
        try {
            var state = encodedState.replace(/\-/g, "+").replace(/_/g, "/");
            if (state.length % 4) state += "=".repeat(4 - state.length % 4);
            state = JSON.parse(atob(state));
        } catch (e) {
            var input = encodedState.replace(/;/g, "\r\n");
            document.getElementById("input").value = input;
        } finally {
            if (state instanceof Object) {
                console.log(state);
                for (var i = 0; i < options.length; i++) {
                    var optionName = options[i];
                    if (state.hasOwnProperty(optionName)) {
                        var elem = document.getElementById(optionName);
                        if (elem.type == "number") elem.value = state[optionName];
                        else if (elem.type == "text" || optionName == "input") elem.value = state[optionName];
                        else if (elem.type == "range") elem.value = state[optionName];
                        else if (elem.type == "checkbox") elem.checked = state[optionName];
                    }
                }
            }
        }
    }

    var handlekey = function (e) {
        setTimeout(requestDraw, 0, true);
    }

    return {
        requestDraw,
    };
})();