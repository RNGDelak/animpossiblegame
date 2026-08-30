/*
BMS and Y_Sequence class Usage
BMS.[Functions] will call a function belong to BMS, and the same for Y_Sequence

- BMS.cmp will return -1,0,1
- BMS.fs(array,n) where array in the format [[collum1],[collum2],[collum3],...]
- BMS.isSuccessor return a boolean

the same for Y_Sequence, but importantly Y_Sequence output is string (except hInv,gInv,isSuccessor and cmp)
*/
class BMS {

   static cmp(m1, m2) {
      function sequence_compare(seq1, seq2) {
         if (seq1.length === 0) {
            if (seq2.length === 0) return 0;
            else return -1;
         } else {
            if (seq2.length === 0) return 1;
            else {
               if (seq1[0] < seq2[0]) return -1;
               else if (seq1[0] > seq2[0]) return 1;
               else return sequence_compare(seq1.slice(1), seq2.slice(1));
            }
         }
      }

      if (m1 === "Limit" && m2 === "Limit") return 0;
      if (m1 === "Limit") return 1;
      if (m2 === "Limit") return -1;

      if (m1.length === 0) return m2.length === 0 ? 0 : -1;
      if (m2.length === 0) return 1;

      let col1 = m1[0];
      let col2 = m2[0];

      const diff = col1.length - col2.length;

      if (diff > 0) {
         col2 = col2.concat(Array(diff).fill(0));
      } else if (diff < 0) {
         col1 = col1.concat(Array(-diff).fill(0));
      }

      const c = sequence_compare(col1, col2);

      return c || this.cmp(m1.slice(1), m2.slice(1));
   }

   static isSuccessor(matrix) {
      return matrix !== "Limit" && (matrix.length === 0 || !matrix.at(-1)?.some(x => x !== 0));
   }

   static fs(m, FSterm) {
      if (m === "Limit") {
         if (FSterm === 0) return [[0]];
         return [
            Array(FSterm).fill(0),
            Array(FSterm).fill(1)
         ];
      }

      if (m.length === 0) {
         return [];
      }

      const parent_cache = Object.create(null);
      const ascending_cache = Object.create(null);

      function parent(x, y) {
         const key = `${x},${y}`;

         if (key in parent_cache) {
            return parent_cache[key];
         }

         let p = x;

         while ((p = y ? parent(p, y - 1) : p - 1) >= 0) {
            if (m[p][y] < m[x][y]) break;
         }

         return parent_cache[key] = p;
      }

      function ascending(r, x, y) {
         const key = `${r},${x},${y}`;

         if (key in ascending_cache) {
            return ascending_cache[key];
         }

         return ascending_cache[key] =
            r <= x &&
            (r === x || ascending(r, parent(x, y), y));
      }

      const endcol = m.length - 1;
      let result = m.slice(0, endcol);

      const child = m[endcol];
      const ymax = child.length - 1;

      let LNZ;

      for (LNZ = ymax; LNZ >= 0; --LNZ) {
         if (child[LNZ] > 0) break;
      }

      if (LNZ < 0) {
         return result;
      }

      const BR = parent(endcol, LNZ);
      const BRcolumn = m[BR];

      const offset = child.map((v, y) =>
         y < LNZ ? v - BRcolumn[y] : 0
      );

      const offsetAsc = Array(endcol)
         .fill(0, BR)
         .map((_, x) =>
            offset.map((v, y) =>
               ascending(BR, x, y) ? v : 0
            )
         );

      for (let n = 1; n <= FSterm; n++) {
         for (let col = BR; col < endcol; col++) {
            result.push(
               m[col].map(
                  (v, y) =>
                     v + offsetAsc[col][y] * n
               )
            );
         }
      }

      if (
         ymax > 0 &&
         result.every(column => column[ymax] === 0)
      ) {
         result = result.map(column =>
            column.slice(0, ymax)
         );
      }

      return result;
   }

   static ZERO = [];

   static f(alpha, beta) {
      let n = 0;

      while (true) {
         const x = this.fs(beta, n);

         if (this.cmp(x, alpha) > 0) {
            return x;
         }

         n++;
      }
   }

   static g(alpha, beta, s) {
      while (true) {
         if (this.isSuccessor(beta)) return alpha;

         const split = this.f(alpha, beta);

         if (s === "") return split;

         const bit = s[0];
         s = s.slice(1);

         if (bit === "0") {
            beta = split;
         } else {
            alpha = split;
         }
      }
   }

   static gInv(alpha, beta, target) {
      let result = "";

      while (!this.isSuccessor(beta)) {
         const split = this.f(alpha, beta);
         const c = this.cmp(target, split);

         if (c === 0) break;

         if (c < 0) {
            result += "0";
            beta = split;
         } else {
            result += "1";
            alpha = split;
         }
      }

      return result;
   }

   static h(x, k = 0.5, maxlen = 100, eps = 1e-10) {
      let result = "";

      while (Math.abs(x - k) > eps && result.length < maxlen) {
         if (x < k) {
            result += "0";
            x = x / k;
         } else {
            result += "1";
            x = (x - k) / (1 - k);
         }
      }

      return result;
   }

   static hInv(s, k = 0.5) {
      let x = k;

      for (let i = s.length - 1; i >= 0; i--) {
         if (s[i] === "0") {
            x = k * x;
         } else {
            x = k + (1 - k) * x;
         }
      }

      return x;
   }
}

class Y_Sequence {

   static fs(s, n, legBasedAscension, stringify) {
      if (Array.isArray(s)) s = s.join(',');
      var lineBreakRegex = /\r?\n/g;
      var itemSeparatorRegex = /[\t ,]/g;
      if (s == "Limit") return '1,' + String(n + 1);
      function parseSequenceElement(s, i) {
         var strremoved = s;
         if (strremoved.indexOf("v") == -1 || !isFinite(Number(strremoved.substring(strremoved.indexOf("v") + 1)))) {
            var numval = Number(strremoved);
            return {
               value: numval,
               position: i,
               parentIndex: -1
            };
         } else {
            return {
               value: Number(strremoved.substring(0, strremoved.indexOf("v"))),
               position: i,
               parentIndex: Math.max(Math.min(i - 1, Number(strremoved.substring(strremoved.indexOf("v") + 1))), -1),
               forcedParent: true
            };
         }
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
      function calcMountain(s, maxDim = Infinity) {
         if (maxDim === undefined) maxDim = Infinity;
         var coordOffset = typeof s == "object" ? s.coord : [];
         if (typeof s == "string") {
            s = s.split(itemSeparatorRegex).map(parseSequenceElement);
         }
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
                  if (m.arr[i].coord[0] == coord[0]) {
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
      function findAbove(m, node) {
         if (node.dim != 0) return null;
         var index = indexFromCoord(m, node.coord);
         if (!index) return null;
         for (var i = index.length - 1; i > 0; i--) {
            index[i] = 0;
            index[i - 1]++;
            index[index.length - 1] = node.position - sumArray(index.slice(0, -1));
            if (!findByIndex(m, index.slice(0, i))) continue;
            var candidate = findByIndex(m, index);
            if (candidate) return candidate;
         }
         return null;
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
      function cloneMountain(mountain) {
         var newMountain = Object.assign({}, mountain);
         if (mountain.dim === 0) {
            newMountain.coord = newMountain.coord.slice(0);
            newMountain.leftLegCoord = newMountain.leftLegCoord && newMountain.leftLegCoord.slice(0);
            newMountain.rightLegCoord = newMountain.rightLegCoord && newMountain.rightLegCoord.slice(0);
         } else {
            newMountain.arr = newMountain.arr.map(cloneMountain);
            newMountain.coord = newMountain.coord.slice(0);
         }
         return newMountain;
      }
      function getBadRoot(s) {
         var mountain;
         if (typeof s == "string") mountain = calcMountain(s);
         else mountain = s;
         return leftLeg(mountain, findHighestWithPosition(mountain, getLastPosition(mountain)));
      }
      function filterEmpty(mountain) {
         if (mountain.dim > 0) {
            for (var i = mountain.arr.length - 1; i >= 0; i--) {
               filterEmpty(mountain.arr[i]);
               if (mountain.arr[i].dim > 0 && mountain.arr[i].arr.length === 0) mountain.arr.slice(i, 1);
            }
         }
         return mountain;
      }
      function findHighestWithPositionBelow(m, sub, position) {
         var crawlIndex = indexFromCoord(m, sub.coord, sub.dim);
         while (true) {
            crawlIndex[crawlIndex.length - 1]--;
            while (crawlIndex.length > 0 && crawlIndex[crawlIndex.length - 1] < 0) {
               crawlIndex.pop();
               crawlIndex[crawlIndex.length - 1]--;
            }
            if (crawlIndex.length === 0) break;
            var r = findHighestWithPosition(findByIndex(m, crawlIndex), position);
            if (r) return r;
         }
         return null;
      }
      var mountain;
      if (typeof s == "string") mountain = calcMountain(s);
      else mountain = s;
      if (stringify === undefined) stringify = true;
      var result = cloneMountain(mountain);
      var badRoot = getBadRoot(mountain);
      var cutPosition = getLastPosition(mountain);
      var topCut = findHighestWithPosition(mountain, cutPosition);
      var cutLookup = topCut;
      while (cutLookup) {
         var parentRow = findByCoord(result, cutLookup.coord, 1);
         parentRow.arr.pop();
         cutLookup = rightLeg(result, cutLookup);
      }
      filterEmpty(result);
      if (badRoot) {
         var badRootPosition = badRoot.position;
         var badRootRow = findByCoord(mountain, badRoot.coord, 1);
         var bottomCut = mountain;
         while (bottomCut.dim > 1) bottomCut = bottomCut.arr[0];
         bottomCut = bottomCut.arr[bottomCut.arr.length - 1];
         var belowCopyStackBase = [];
         var aboveCopyStackBase = [];
         var topCutIndex = indexFromCoord(mountain, topCut.coord);
         var crawlIndex = topCutIndex.slice(0, -1);
         while (true) {
            crawlIndex[crawlIndex.length - 1]--;
            while (crawlIndex.length > 0 && crawlIndex[crawlIndex.length - 1] < 0) {
               crawlIndex.pop();
               crawlIndex[crawlIndex.length - 1]--;
            }
            if (crawlIndex.length === 0) break;
            var sourceSubMountain = findByIndex(mountain, crawlIndex);
            var destSubMountain = findByIndex(result, crawlIndex);
            belowCopyStackBase.push([sourceSubMountain, destSubMountain, null, 0, false]);
         }
         crawlIndex = topCutIndex.slice(0, -1);
         if (indexFromCoord(result, findByIndex(mountain, crawlIndex).coord, 1)) {
            while (true) {
               var sourceSubMountain = findByIndex(mountain, crawlIndex);
               var destSubMountain = findByIndex(result, crawlIndex);
               aboveCopyStackBase.unshift([sourceSubMountain, destSubMountain]);
               crawlIndex[crawlIndex.length - 1]++;
               while (crawlIndex.length > 0 && crawlIndex[crawlIndex.length - 1] >= findByIndex(mountain, crawlIndex.slice(0, -1)).arr.length) {
                  crawlIndex.pop();
                  crawlIndex[crawlIndex.length - 1]++;
               }
               if (crawlIndex.length === 0) break;
            }
         }
      }
      var subCutCache = {};
      var subBadRootCache = {};
      var subBadRootRowCache = {};
      var topNodeCache = {};
      var isAscendingCache = {};
      for (var i = 0; i <= n && badRoot; i++) {
         for (var x = i === 0 ? cutPosition : badRootPosition + 1; x < cutPosition + (i < n); x++) {
            var nodeBelow = null;
            var belowCopyStack = belowCopyStackBase.slice(0);
            while (belowCopyStack.length) {
               var popItem = belowCopyStack.pop();
               var sourceSubMountain = popItem[0];
               var destSubMountain = popItem[1];
               var cleanCopySource = popItem[2];
               var cleanCopyOffset = popItem[3];
               var ignoreBelow = popItem[4];
               var sourceSubMountainID = sourceSubMountain.coord.join(",") + "," + sourceSubMountain.dim;
               if (subCutCache[sourceSubMountainID] === undefined) {
                  var subCut = findHighestWithPosition(sourceSubMountain, cutPosition);
                  var subBadRoot = findHighestWithPosition(sourceSubMountain, badRootPosition);
                  var subBadRootRow = subBadRoot && findByCoord(sourceSubMountain, subBadRoot.coord, 1);
                  subCutCache[sourceSubMountainID] = subCut;
                  subBadRootCache[sourceSubMountainID] = subBadRoot;
                  subBadRootRowCache[sourceSubMountainID] = subBadRootRow;
               } else {
                  var subCut = subCutCache[sourceSubMountainID];
                  var subBadRoot = subBadRootCache[sourceSubMountainID];
                  var subBadRootRow = subBadRootRowCache[sourceSubMountainID];
               }
               var sourceSubMountainAndPositionID = sourceSubMountainID + "," + x;
               if (topNodeCache[sourceSubMountainAndPositionID] === undefined) {
                  var topNode = findHighestWithPosition(sourceSubMountain, x);
                  topNodeCache[sourceSubMountainAndPositionID] = topNode;
                  if (!topNode) continue;
                  if (legBasedAscension) {
                     var nodeInSubBadRootRow = subBadRootRow && findHighestWithPosition(subBadRootRow, x);
                     while (nodeInSubBadRootRow && nodeInSubBadRootRow.position > badRootPosition) {
                        var leftLegPosition = nodeInSubBadRootRow.leftLegCoord ? sumArray(nodeInSubBadRootRow.leftLegCoord) : nodeInSubBadRootRow.position - 1;
                        nodeInSubBadRootRow = findHighestWithPosition(subBadRootRow, leftLegPosition);
                     }
                     var isAscending = nodeInSubBadRootRow && nodeInSubBadRootRow.position == badRootPosition;
                     isAscendingCache[sourceSubMountainAndPositionID] = isAscending;
                  } else {
                     var referenceRow = subBadRootRow && subBadRootRow.coord[1] && findByCoord(sourceSubMountain, addCoord(subBadRootRow.coord, 1, -1), 1) || subBadRootRow;
                     var nodeInReferenceRow = referenceRow && findHighestWithPosition(referenceRow, x);
                     while (nodeInReferenceRow && nodeInReferenceRow.position > badRootPosition) nodeInReferenceRow = parent(referenceRow, nodeInReferenceRow);
                     var isAscending = nodeInReferenceRow && nodeInReferenceRow.position == badRootPosition;
                     isAscendingCache[sourceSubMountainAndPositionID] = isAscending;
                  }
               } else {
                  var topNode = topNodeCache[sourceSubMountainAndPositionID];
                  if (!topNode) continue;
                  var isAscending = isAscendingCache[sourceSubMountainAndPositionID];
               }

               if (sourceSubMountain.dim == 1) {
                  if (cleanCopySource) {
                     var position = x + (cutPosition - badRootPosition) * i;
                     var sourceNode = findHighestWithPosition(cleanCopySource, x);
                     var sourceLeftLegPosition = sourceNode.leftLegCoord ? sumArray(sourceNode.leftLegCoord) : x - 1;
                     var leftLegPosition = sourceLeftLegPosition >= badRootPosition ? sourceLeftLegPosition + (cutPosition - badRootPosition) * i : sourceLeftLegPosition;
                     var nodeLeftDown = findHighestWithPositionBelow(result, destSubMountain, leftLegPosition);
                     var leftLegCoord = nodeLeftDown ? nodeLeftDown.coord : null;
                     var rightLegCoord = nodeBelow ? nodeBelow.coord : null;
                     if (nodeBelow) {
                        if (equalVector(leftLegCoord, rightLegCoord, 1)) {
                           var leftLegIndex = indexFromCoord(result, leftLegCoord);
                           nodeBelow.parentIndex = leftLegIndex[leftLegIndex.length - 1];
                        } else {
                           nodeBelow.parentIndex = -1;
                        }
                     }
                     destSubMountain.arr.push(nodeBelow = {
                        dim: 0,
                        value: NaN,
                        position: position,
                        coord: addCoord(destSubMountain.coord, 0, position - sumArray(destSubMountain.coord)),
                        parentIndex: -1,
                        forcedParent: sourceNode.forcedParent,
                        leftLegCoord: leftLegCoord,
                        rightLegCoord: rightLegCoord
                     });
                  } else {
                     var position = x + (cutPosition - badRootPosition) * i;
                     var sourceNode = findHighestWithPosition(sourceSubMountain, x);
                     var sourceLeftLegPosition = sourceNode.leftLegCoord ? sumArray(sourceNode.leftLegCoord) : -1;
                     var leftLegPosition = sourceLeftLegPosition >= badRootPosition ? sourceLeftLegPosition + (cutPosition - badRootPosition) * i : sourceLeftLegPosition;
                     var nodeLeftDown = findHighestWithPositionBelow(result, destSubMountain, leftLegPosition);
                     var leftLegCoord = nodeLeftDown ? nodeLeftDown.coord : null;
                     var rightLegCoord = nodeBelow ? nodeBelow.coord : null;
                     if (nodeBelow) {
                        if (equalVector(leftLegCoord, rightLegCoord, 1)) {
                           var leftLegIndex = indexFromCoord(result, leftLegCoord);
                           nodeBelow.parentIndex = leftLegIndex[leftLegIndex.length - 1];
                        } else {
                           nodeBelow.parentIndex = -1;
                        }
                     }
                     destSubMountain.arr.push(nodeBelow = {
                        dim: 0,
                        value: NaN,
                        position: position,
                        coord: addCoord(destSubMountain.coord, 0, position - sumArray(destSubMountain.coord)),
                        parentIndex: -1,
                        forcedParent: sourceNode.forcedParent,
                        leftLegCoord: leftLegCoord,
                        rightLegCoord: rightLegCoord
                     });
                  }
               } else {
                  var subCutHeight = subCut && subCut.coord[sourceSubMountain.dim - 1] || 0;
                  var subBadRootHeight = subBadRoot && subBadRoot.coord[sourceSubMountain.dim - 1] || 0;
                  var topNodeHeight = topNode.coord[sourceSubMountain.dim - 1] || 0;
                  if (isAscending) {
                     if (cleanCopySource) {
                        var generationsFromSubBadRoot = 0;
                        var nodeInCleanCopySource = findHighestWithPosition(cleanCopySource, x);
                        if (nodeInCleanCopySource.leftLegCoord) {
                           var lowAncestorNode = nodeInCleanCopySource;
                           while (lowAncestorNode.position > badRootPosition) {
                              lowAncestorNode = findHighestWithPosition(cleanCopySource, sumArray(lowAncestorNode.leftLegCoord));
                              generationsFromSubBadRoot++;
                           }
                        } else {
                           generationsFromSubBadRoot = x - badRootPosition;
                        }
                        var lastReplacedCut = findHighestWithPosition(destSubMountain, badRootPosition + (cutPosition - badRootPosition) * i);
                        var lastReplacedCutHeight = lastReplacedCut && lastReplacedCut.coord[sourceSubMountain.dim - 1] || 0;
                        var targetHeight = i === 0 ? topNodeHeight : lastReplacedCutHeight + generationsFromSubBadRoot - cleanCopyOffset;
                        if (ignoreBelow) {
                           while (destSubMountain.arr.length < targetHeight + 1) {
                              destSubMountain.arr.push({
                                 dim: destSubMountain.dim - 1,
                                 arr: [],
                                 coord: addCoord(destSubMountain.coord, destSubMountain.dim - 1, destSubMountain.arr.length)
                              });
                           }
                           for (var j = targetHeight; j >= 0; j--) {
                              belowCopyStack.push([sourceSubMountain.arr[subBadRootHeight], destSubMountain.arr[j], cleanCopySource, Math.max(j - lastReplacedCutHeight + cleanCopyOffset, 0), true]);
                           }
                        } else {
                           if (!lastReplacedCut || cleanCopyOffset) throw Error("Something went wrong");
                           while (destSubMountain.arr.length < targetHeight + 1) {
                              destSubMountain.arr.push({
                                 dim: destSubMountain.dim - 1,
                                 arr: [],
                                 coord: addCoord(destSubMountain.coord, destSubMountain.dim - 1, destSubMountain.arr.length)
                              });
                           }
                           for (var j = targetHeight; j >= 0; j--) {
                              if (j < subBadRootHeight) {
                                 belowCopyStack.push([sourceSubMountain.arr[j], destSubMountain.arr[j], null, 0, false]);
                              } else {
                                 belowCopyStack.push([sourceSubMountain.arr[subBadRootHeight], destSubMountain.arr[j], cleanCopySource, Math.max(j - lastReplacedCutHeight + cleanCopyOffset, 0), j > subBadRootHeight]);
                              }
                           }
                        }
                     } else {
                        if (cleanCopyOffset) throw Error("Something went wrong");
                        if (ignoreBelow) {
                           var lastReplacedCut = findHighestWithPosition(destSubMountain, badRootPosition + (cutPosition - badRootPosition) * i);
                           var lastReplacedCutHeight = lastReplacedCut && lastReplacedCut.coord[sourceSubMountain.dim - 1] || 0;
                           if (!lastReplacedCut && cleanCopyOffset) throw Error("Something went wrong");
                           var targetHeight = i === 0 ? topNodeHeight : lastReplacedCutHeight + topNodeHeight;
                           while (destSubMountain.arr.length < targetHeight - subBadRootHeight + 1) {
                              destSubMountain.arr.push({
                                 dim: destSubMountain.dim - 1,
                                 arr: [],
                                 coord: addCoord(destSubMountain.coord, destSubMountain.dim - 1, destSubMountain.arr.length)
                              });
                           }
                           for (var j = targetHeight; j >= subBadRootHeight; j--) {
                              if (j < lastReplacedCutHeight + subBadRootHeight + (sourceSubMountain.dim == 2)) {
                                 belowCopyStack.push([sourceSubMountain.arr[subBadRootHeight], destSubMountain.arr[j - subBadRootHeight], subBadRootRow, 0, true]);
                              } else {
                                 belowCopyStack.push([sourceSubMountain.arr[j - lastReplacedCutHeight], destSubMountain.arr[j - subBadRootHeight], null, 0, j == lastReplacedCutHeight + subBadRootHeight]);
                              }
                           }
                        } else {
                           while (destSubMountain.arr.length < topNodeHeight + (subCutHeight - subBadRootHeight) * i + 1) {
                              destSubMountain.arr.push({
                                 dim: destSubMountain.dim - 1,
                                 arr: [],
                                 coord: addCoord(destSubMountain.coord, destSubMountain.dim - 1, destSubMountain.arr.length)
                              });
                           }
                           for (var j = topNodeHeight + (subCutHeight - subBadRootHeight) * i; j >= 0; j--) {
                              if (j < subBadRootHeight) {
                                 belowCopyStack.push([sourceSubMountain.arr[j], destSubMountain.arr[j], null, 0, false]);
                              } else if (j < subBadRootHeight + (subCutHeight - subBadRootHeight) * i + (sourceSubMountain.dim == 2)) {
                                 belowCopyStack.push([sourceSubMountain.arr[subBadRootHeight], destSubMountain.arr[j], subBadRootRow, 0, j > subBadRootHeight]);
                              } else {
                                 belowCopyStack.push([sourceSubMountain.arr[j - (subCutHeight - subBadRootHeight) * i], destSubMountain.arr[j], null, 0, i !== 0 && j == subBadRootHeight + (subCutHeight - subBadRootHeight) * i]);
                              }
                           }
                        }
                     }
                  } else {
                     if (cleanCopySource || cleanCopyOffset || ignoreBelow) throw Error("Something went wrong");
                     while (destSubMountain.arr.length < topNodeHeight + 1) {
                        destSubMountain.arr.push({
                           dim: destSubMountain.dim - 1,
                           arr: [],
                           coord: addCoord(destSubMountain.coord, destSubMountain.dim - 1, destSubMountain.arr.length)
                        });
                     }
                     for (var j = topNodeHeight; j >= 0; j--) {
                        belowCopyStack.push([sourceSubMountain.arr[j], destSubMountain.arr[j], null, 0, false]);
                     }
                  }
               }
            }
            var aboveCopySourceX = x == cutPosition ? badRootPosition : x;
            var aboveCopyStack = aboveCopyStackBase.slice(0);
            while (aboveCopyStack.length) {
               var popItem = aboveCopyStack.pop();
               var sourceSubMountain = popItem[0];
               var destSubMountain = popItem[1];
               var topNode = findHighestWithPosition(sourceSubMountain, aboveCopySourceX);
               if (!topNode) continue;

               if (sourceSubMountain.dim == 1) {
                  var position = x + (cutPosition - badRootPosition) * i;
                  var nodeInSourceSubMountain = topNode;
                  var sourceLeftLegPosition = nodeInSourceSubMountain.leftLegCoord ? sumArray(nodeInSourceSubMountain.leftLegCoord) : -1;
                  var leftLegPosition = sourceLeftLegPosition >= badRootPosition ? sourceLeftLegPosition + (cutPosition - badRootPosition) * i : sourceLeftLegPosition;
                  var nodeLeftDown = findHighestWithPositionBelow(result, destSubMountain, leftLegPosition);
                  var leftLegCoord = nodeLeftDown ? nodeLeftDown.coord : null;
                  var rightLegCoord = nodeBelow ? nodeBelow.coord : null;
                  if (nodeBelow) {
                     if (equalVector(leftLegCoord, rightLegCoord, 1)) {
                        var leftLegIndex = indexFromCoord(result, leftLegCoord);
                        nodeBelow.parentIndex = leftLegIndex[leftLegIndex.length - 1];
                     } else {
                        nodeBelow.parentIndex = -1;
                     }
                  }
                  destSubMountain.arr.push(nodeBelow = {
                     dim: 0,
                     value: NaN,
                     position: position,
                     coord: addCoord(destSubMountain.coord, 0, position - sumArray(destSubMountain.coord)),
                     parentIndex: -1,
                     forcedParent: nodeInSourceSubMountain.forcedParent,
                     leftLegCoord: leftLegCoord,
                     rightLegCoord: rightLegCoord
                  });
               } else {
                  var topNodeHeight = topNode && topNode.coord[sourceSubMountain.dim - 1] || 0;
                  for (var j = topNodeHeight; j >= 0; j--) {
                     aboveCopyStack.push([sourceSubMountain.arr[j], destSubMountain.arr[j]]);
                  }
               }
            }
         }
      }
      var lastBottomNode = result;
      while (lastBottomNode && lastBottomNode.dim > 0) {
         if (lastBottomNode.dim == 1) {
            lastBottomNode = lastBottomNode.arr[lastBottomNode.arr.length - 1];
         } else {
            lastBottomNode = lastBottomNode.arr[0];
         }
      }
      var resultLength = lastBottomNode && lastBottomNode.position || 0;
      for (var x = 0; x <= resultLength; x++) {
         var node = findHighestWithPosition(result, x);
         var aboveNode = null;
         while (node) {
            if (isNaN(node.value)) {
               if (aboveNode) {
                  var pseudoParentNode = leftLeg(result, aboveNode);
                  if (node.coord.length == pseudoParentNode.coord.length) {
                     for (var i = node.coord.length - 1; i >= 0; i--) {
                        if (i === 0 && !equalVector(node.coord, aboveNode.coord, 2) || node.coord[i] < pseudoParentNode.coord[i] || equalVector(node.coord, aboveNode.coord, i + 1) && node.coord[i] > pseudoParentNode.coord[i] + 1) {
                        } else if (node.coord[i] > pseudoParentNode.coord[i]) break;
                     }
                  }
                  node.value = pseudoParentNode.value + aboveNode.value;
               } else {
                  node.value = 1;
               }
            }
            aboveNode = node;
            node = rightLeg(result, node);
         }
      }
      var rr;
      if (stringify) {
         rr = [];
         if (result.arr.length) {
            var bottomrow = result;
            while (bottomrow.dim > 1) bottomrow = bottomrow.arr[0];
            for (var i = 0; i < bottomrow.arr.length; i++) {
               rr.push(bottomrow.arr[i].value + (bottomrow.arr[i].forcedParent ? "v" + bottomrow.arr[i].parentIndex : ""));
            }
         }
         rr = rr.join(",");
      } else {
         rr = result;
      }
      return rr;
   }

   static cmp(a, b) {
      if (a === "Limit" && b === "Limit") return 0;
      if (a === "Limit") return 1;
      if (b === "Limit") return -1;

      if (typeof a === "string") a = a.split(',').map(Number);
      if (typeof b === "string") b = b.split(',').map(Number);

      const n = Math.min(a.length, b.length);

      for (let i = 0; i < n; i++) {
         if (a[i] < b[i]) return -1;
         if (a[i] > b[i]) return 1;
      }

      if (a.length < b.length) return -1;
      if (a.length > b.length) return 1;
      return 0;
   }
   static isSuccessor(array) {
      if (array == '') return true;
      if (array == "Limit") return false;
      if (typeof array === "string") array = array.split(',').map(Number);
      return array.length === 0 || array.at(-1) === 1;
   }


   static ZERO = ''

   static f(alpha, beta) {

      let n = 0;

      while (true) {
         const x = this.fs(beta, n);

         if (this.cmp(x, alpha) > 0) {
            return x;
         }

         n++;
      }
   }


   static g(alpha, beta, s) {
      while (true) {
         if (this.isSuccessor(beta)) return alpha;

         const split = this.f(alpha, beta);

         if (s === "") return split;

         const bit = s[0];
         s = s.slice(1);

         if (bit === "0") {
            beta = split;
         } else {
            alpha = split;
         }
      }
   }

   static gInv(alpha, beta, target) {
      let result = "";

      while (!this.isSuccessor(beta)) {
         const split = this.f(alpha, beta);
         const c = this.cmp(target, split);

         if (c === 0) break;

         if (c < 0) {
            result += "0";
            beta = split;
         } else {
            result += "1";
            alpha = split;
         }
      }

      return result;
   }

   static h(x, k = 0.5, maxlen = 100, eps = 1e-10) {
      let result = "";

      while (Math.abs(x - k) > eps && result.length < maxlen) {
         if (x < k) {
            result += "0";
            x = x / k;
         } else {
            result += "1";
            x = (x - k) / (1 - k);
         }
      }

      return result;
   }

   static hInv(s, k = 0.5) {
      let x = k;

      for (let i = s.length - 1; i >= 0; i--) {
         if (s[i] === "0") {
            x = k * x;
         } else {
            x = k + (1 - k) * x;
         }
      }

      return x;
   }
}

let Lim_BMS_in_Yseq = '1,3' // Lim(BMS) is 1,3 in y

/*
THIS IS JUST AN APPROXIMATION NOT EXACT
AFTER BH , IT SEEMS WRONG FOR ALL
*/

function Conv_BMS_Y_sequence(ord) {
   return Y_Sequence.g(Y_Sequence.ZERO, Lim_BMS_in_Yseq, BMS.gInv(BMS.ZERO, "Limit", ord))
}

function Conv_Y_sequence_BMS(ord) {
   return BMS.g(BMS.ZERO, "Limit", Y_Sequence.gInv(Y_Sequence.ZERO, Lim_BMS_in_Yseq, ord));
}



function Conv_BMS_OCF(matrix) {
   function eq(a, b) {
      if (typeof (a) == 'number') { return a == b; }
      if (a.length == 2) { return eq(a[0], b[0]) && eq(a[1], b[1]); }
      return eq(a[0], b[0]) && eq(a[1], b[1]) && eq(a[2], b[2]);
   }

   // FROM COCF PROGRAM

   function paren(x, n) {
      console.log()
      let q = x[n] == '(' ? 1 : -1;
      let i = n;
      let t = 0;
      while (1) { t += (x[i] == '(' ? 1 : x[i] == ')' ? -1 : 0); if (!t) { break; }; i += q; }
      return i;
   }

   function firstTerm(x) {
      console.log()
      let m = paren(x, 1);
      return [x.slice(0, m + 1), x.slice(m + 2) || '0'];
   }

   function lastTerm(x) {
      console.log()
      let m = paren(x, x.length - 1);
      return [x.slice(0, m - 2) || '0', x.slice(m - 1)];
   }

   function terms(x) {
      console.log()
      if (x == '0') { return []; }
      return [firstTerm(x)[0]].concat(terms(firstTerm(x)[1]));
   }

   function arg(x) {
      console.log()
      return firstTerm(x)[0].slice(2, -1);
   }

   function lt(x, y) {
      console.log()
      if (y == '0') { return false; }
      if (x == '0') { return true; }
      if (x[0] == 'p' && y[0] == 'P') { return true; }
      if (x[0] == 'P' && y[0] == 'p') { return false; }
      if (arg(x) != arg(y)) { return lt(arg(x), arg(y)); }
      return lt(firstTerm(x)[1], firstTerm(y)[1]);
   }

   function gt(x, y) { return !(x == y || lt(x, y)) }

   function add(x, y) {
      if (x == '0') { return y; }
      if (y == '0') { return x; }
      if (lt(firstTerm(x)[0], firstTerm(y)[0])) { return y; }
      let z = firstTerm(x)[0]
      let w = add(firstTerm(x)[1], y);
      if (w != '0') { return z + '+' + w; }
      return z;
   }

   function sub(x, y) {
      if (x == '0') { return '0'; }
      if (y == '0') { return x; }
      if (lt(firstTerm(y)[0], firstTerm(x)[0])) { return x; }
      return sub(firstTerm(x)[1], firstTerm(y)[1]);
   }

   function sua(x) { return split(x, 'P(0)'); }

   function exp(a) {
      if (a[0] == 'P') { return `P(${sub(a, 'P(0)')})`; }
      if (lt(a, 'p(p(P(0)))')) { return `p(${a})`; }
      let [x, y] = sua(arg(a));
      let p = split(y, `p(${add(x, 'P(0)')})`)[0];
      return 'p(' + add(x, add(p, sub(a, 'p(' + add(x, p) + ')'))) + ')';
   }

   function log(a) {
      if (a == '0') { return '0'; }
      if (a[0] == 'P') { return add('P(0)', arg(a)); }
      let [x, y] = sua(arg(a));
      let [p, q] = split(y, `p(${add(x, 'P(0)')})`);
      if (x == '0' && p == '0') {
         return q;
      }
      let m = add(`p(${add(x, p)})`, q);
      return m;
   }

   function div(a, b) { // only works when b is a.p.
      if (lt(a, b)) { return '0'; }
      return add(exp(sub(log(a), log(b))), div(firstTerm(a)[1], b));
   }

   function mul(a, b) { // only works when a is a.p.
      if (b == '0') { return '0'; }
      return add(exp(add(log(a), log(b))), mul(a, firstTerm(b)[1]))
   }

   function split(a, x) {
      if (a == '0') { return ['0', '0']; }
      if (lt(a, x)) { return ['0', a]; }
      if (lt(firstTerm(a)[0], x)) { return ['0', a]; }
      return [add(firstTerm(a)[0], split(firstTerm(a)[1], x)[0]), split(firstTerm(a)[1], x)[1]];
   }

   function op(x) { // "does it need parentheses when you write something*x"
      if (lt(x, 'p(p(0))')) { return false; }
      let f = (x[0] == 'p') ? `p(${sua(arg(x))[0]})` : 'P(0)';
      let g = null;
      let h = null;
      if (f == 'p(0)') { f = 'p(p(0))'; g = log(x); h = exp(g); }
      else { g = div(log(x), f); h = exp(mul(f, g)) }
      let c = div(x, h);
      let d = sub(x, mul(h, div(x, h)));
      if (d != '0') { return true; }
      return false;
   }

   // does not handle I(ψ(T^M),1) because it's too complicated
   function display(x, y) {
      //if(!y){return 'X'}
      //console.log(x);
      if (x == '0') { return '0'; }
      if (/^(p\(0\)\+)*p\(0\)$/.test(x)) { return ((x.length + 1) / 5).toString(); }
      let f = (x[0] == 'p') ? `p(${sua(arg(x))[0]})` : 'P(0)';
      let f1 = (x[0] == 'p') ? sua(arg(x), 'P(0)')[1] : arg(x);
      let g = null;
      let h = null;
      if (f == 'p(0)') { f = 'p(p(0))'; g = log(x); h = firstTerm(x)[0]; }
      else { g = div(log(x), f); h = `${f == 'P(0)' ? 'P' : 'p'}(${split(arg(x), f)[0]})`; }
      let c = div(x, h);
      let d = sub(x, mul(h, div(x, h)));
      //console.log(f,g,h,'',c,d);
      if (c == 'p(0)' && d == '0') {
         if (exp(x) != x) {
            if (x == 'p(p(0))') { return 'ω'; }
            if (lt(x, 'p(P(0))')) { return `ω<sup>${display(log(x))}</sup>`; }
            return `${display(f)}<sup>${display(g)}</sup>`
         }
         if (x == 'P(0)') { return 'T'; }
         let m = div(log(lastTerm(arg(x))[1]), 'P(0)');
         let k = exp(mul('P(0)', div(log(lastTerm(arg(x))[1]), 'P(0)')));
         k = div(arg(x), k);
         //console.log(arg(x),k,m)
         k = sua(k);
         t = exp(add(mul('P(0)', m), 'P(0)'));
         let l = null;
         if (k[0] == '0') { l = '0'; }
         else { l = 'p(' + mul(exp(mul('P(0)', m)), k[0]) + ')'; }
         let r = 'p(' + mul(exp(mul('P(0)', m)), add(k[0], 'P(0)')) + ')';
         let [a, b] = split(k[1], r);
         a = 'p(' + mul(exp(mul('P(0)', m)), a) + ')'
         //console.log(k,r,l,a,b)
         if (a == 'p(0)') { a = '0'; }
         l = add(l, add(a, b))
         let s = ''
         if (lastTerm(arg(x))[1][0] == 'P' && b != '0') {
            if (m == 'p(0)') { s = 'Ω'; }
            else if (m == 'p(0)+p(0)') { s = 'I'; }
            else if (lt(m, 'p(P(P(p(P(P(P(0)))))))')) { s = `I(${display(sub(m, 'p(0)+p(0)'))},x)`; }
            else if (m == 'P(0)') { s = 'M'; }
            else if (m == 'P(P(0))') { s = 'N'; }
            else if (m == 'P(P(P(0)))') { s = 'K'; }
            else if (m == 'P(P(P(P(0))))') { s = 'U'; }
            else if (lt(m, 'P(p(P(P(P(0)+p(P(P(P(0)+P(0))))))))') && !lt(lastTerm(m)[1], 'P(0)')) { s = `M(${display(sub(div(m, 'P(0)'), 'p(0)'))},x)`; }
            if (s == '') { return `ψ(${display(arg(x))})`; }
            if (l == 'p(0)') { return s.replace('x', '0'); }
            if (s.includes('x')) { return s.replace('x', display(sub(l, 'p(0)'))); }
            return `${s}<sub>${display(l)}</sub>`;
         }
         if (lt(f, 'p(P(p(P(P(0)))))') && gt(x, 'p(P(0))')) { return `ψ<sub>${display(div(arg(f), 'P(0)'))}</sub>(${display(f1)})`; }
         return `ψ(${display(arg(x))})`;
      }
      let a = display(h);
      //console.log(f,h,c,d)
      if (c != 'p(0)') {
         if (!op(c)) { a += display(c) }
         else { a += `&sdot;(${display(c)})`; }
      }
      if (d != '0') { a += '+' + display(d); }
      return a;
   }

   // END COCF

   function P(M, r, n) {
      if (r == -1) { return n - 1; }
      let q = P(M, r - 1, n);
      while (q > -1 && M[q][r] >= M[n][r]) { q = P(M, r - 1, q); }
      return q;
   }

   function C(M, n) {
      let X = [];
      for (let i = 0; i < M.length; i++) {
         if (P(M, 0, i) == n) { X.push(i); }
      }
      return X;
   }

   function CR(M, n) { // modified slightly to handle use in mv
      let X = [];
      for (let i = 0; i < M.length; i++) {
         if (P(M, 0, i) == n) {
            X.push(i);
            if (M[i][2]) { X = X.concat(CR(M, i)) };
         }
      }
      return X;
   }

   function D(M, n) {
      let X = 0;
      for (let i = 0; i < M.length; i++) {
         if (P(M, 0, i) == n && M[i][1] > 0) { X++; }
      }
      return X;
   }

   function U(M, n) {
      if (M[n][1] == 0 || M[n][2] == 1 || n + 1 == M.length) { return [0, null]; }
      let m = P(M, 1, n);
      let L = [M[m][0] + 1, M[n][1], M[m][2] + 1];
      if (P(M, 1, n) == P(M, 1, n + 1) && eq(M[n + 1], L)) { return [1, n + 1]; }
      let q = n;
      let p = n;
      while (q != -1) {
         q = P(M, 0, q);
         if (P(M, 1, n) == P(M, 1, q) && eq(M[q], L) && M[n + 1][0] > M[q][0]) {
            if (M[p][2] == 1) { return [2, q] };
            return [1, q];
         }
         p = q;
      }
      return [0, null];
   }

   function mv(M, n, k) { // value of upgrader; k is same as in ov
      if (k) {
         let A = [k];
         while (A.at(-1) != n) { // "correct" value of k (justified?)
            A.push(P(M, 0, A.at(-1)));
            if (!M[A.at(-1)][0]) { break; } // if this ever gets used something's gone wrong
         }
         if (A.includes(n)) {
            for (i of A.toReversed()) {
               if (M[i][2] == 0) { k = i; break; }
            }
         }
      }
      let S = '0';
      for (i of C(M, n)) {
         if (i > k && k) { break; }
         if (M[i][2] != 1) { continue; }
         let q = '0';
         for (j of C(M, i)) {
            if (j > k && k) { break; }
            q = add(q, ov(M, j, k));
         }
         S = add(S, exp(q));
      }
      let X = C(M, n).filter(x => M[x][2] && C(M, x).length);
      let p;
      if (!X.length) { p = 1; }
      else { p = M[CR(M, X.at(-1)).at(-1)][2]; }
      if (lt(sua(S)[1], 'p(p(0))') && p && !k) { S = add(S, 'p(0)'); } // 111 211 311 = ψ(T^2·ω), not ψ(T^2)
      // also, if k!=0, the condition will never be activated, since then it's a fixed point.
      return exp(S);
   }

   function ov(M, n, k) { // k = 3 (31) in 0 111 211 31 2 (-> T, since 31 is chain-upgraded)
      if (n == k) { return 'P(0)'; }
      if (M[n][2] == 0) { return o(M, n, k); }
      let S = '0';
      for (let i of C(M, n)) {
         if (i > k && k) { break; }
         S = add(S, ov(M, i, k));
      }
      return `P(${S})`;
   }

   function v(M, n, k) { // k is necessary to make the k value persist from ov (maybe? keeping it just in case)
      // console.log(n,k)
      if (M[n][1] == 0) { return '0'; }
      if (M[n][2] == 0) {
         let u = U(M, n);
         u = (u[0] ? mv(M, u[1], n * (u[0] == 2)) : 'p(0)');
         return add(v(M, P(M, 1, n), k), u);
      }
      return add(v(M, P(M, 2, n), k), mv(M, n, k));
   }

   function o(M, n, k) { // k is necessary to make the k value persist from ov
      let S = '0';
      for (let i of C(M, n)) {
         if (i > k && k) { break; }
         if (skipped(M, n).includes(i)) { continue; }
         S = add(S, o(M, i, k));
      }
      return `p(${add(mul('P(0)', v(M, n, k)), S)})`;
   }

   function skipped(M, n) {
      let S = [];
      let u = [...Array(M.length).keys()].map(x => (U(M, x)[0] == 1 ? U(M, x)[1] : null));
      //let u2=[...Array(M.length).keys()].map(x=>(U(M,x)[0]==2?U(M,x)[1]:null));
      for (let i of C(M, n)) {
         S = S.concat(skipped(M, i)); // for display purposes
         if (M[i][2] && M[n][2]) { S.push(i); continue; }
         if (u.includes(i)) {
            let c = C(M, i);
            if (c.length) { // e.g. 0 111 211 21 111 211
               let j = c.at(-1);
               if (eq(M[j], [M[i][0] + 1, M[i][1], 1])) { S.push(i); }
               else if (eq(U(M, j - 1), [2, i]) && eq(M[j], [M[i][0] + 1, 0, 0]) && !C(M, j).length) { S.push(i); }
            }
            else { S.push(i); continue; }
         }
         if (eq(M[i], [M[n][0] + 1, 0, 0]) && eq(U(M, i - 1), [2, n]) && !C(M, i).length) { S.push(i); continue; }
      }
      return S;
   }

   // standardization

   function psi(a) { return `p(${a})`; }
   function _0(a) { return sua(arg(a))[0]; }
   function _1(a) { return sua(arg(a))[1]; }
   function _01(a) { return firstTerm(a)[0]; }
   function _2(a) { return firstTerm(a)[1]; }

   function ttc(a, b) {
      if (a == '0') { return '0'; }
      if (ttc(_2(a), b) == '0' && lt(_01(a), psi(b))) { return '0'; }
      return add(_01(a), ttc(_2(a), b));
   }

   function sp(a, b, c) {
      if (c == '0') { return psi(add(a, b)); }
      if (lt(b, _1(c)) && gt(c, psi(a))) {
         let t = ttc(_1(c), add(_0(c), 'P(0)'));
         //console.log(t);
         return sp(a, add(t, sub(_01(c), psi(add(_0(c), t)))), _2(c));
      }
      return sp(a, add(b, _01(c)), _2(c));
   }

   function sf(a) {
      if (a == '0') { return '0'; }
      if (a[0] == 'P') { return add(`P(${sf(arg(a))})`, sf(_2(a))); }
      return add(sp(sf(_0(a)), '0', sf(_1(a))), sf(_2(a)));
   }

   function _o(M) {
      let S = '0';
      for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = add(S, o(M, i)); } }
      return sf(S);
   }

   function NS(M) {
      let S = '0';
      for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = add(S, o(M, i)); } }
      return S;
   }

   function _skipped(M) {
      let S = [];
      for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = S.concat(skipped(M, i)); } }
      return S;
   }
   function processMatrix(M) {
      return M.map(row => {
         let r = row.slice();
         while (r.length < 3) {
            r.push(0);
         }
         return r;
      });
   }
   return display(_o(processMatrix(matrix)))
}

/*
For pretty printing use cOCF.convert
*/

class cOCF {
   // Static class properties
   static bo = 'Limit';
   static col = 'c';
   static format = 1;
   static mf = false;
   static ZERO = '';

   // get position of last symbol p of string st (if l=true then first)
   static getls(st, p, l = false) {
      let e = l ? -1 : st.length;
      let np = 0;
      while (((!l && e > -1) || (l && e < st.length)) && (np != 0 || st[e] != p)) {
         l ? e++ : e--;
         if (st[e] == '[') np--;
         else if (st[e] == ']') np++;
      }
      return e;
   }

   // create [booster]base string
   static bb(booster, base) {
      return '[' + booster + ']' + base;
   }

   // get base of string st
   static base(st) {
      return st.slice(this.getls(st, ']', true) + 1);
   }

   // get booster of string st
   static booster(st) {
      return st.slice(1, this.getls(st, ']', true));
   }

   // get successor of ordinal st
   static suc(st) {
      return '[]' + st;
   }

   // get predecessor of successor ordinal st = X + 1
   static pred(st) {
      return st.slice(2);
   }

   // finite ordinal string st to number
   static fostn(st) {
      return st.length / 2;
   }

   // finite ordinal e from integer to computer format
   static cf(e) {
      let s = '';
      for (let i = 0; i < e; i++)
         s = this.suc(s);
      return s;
   }

   // cmp expressions st1, st2 (if st1<st2 then -1; if st1=st2 then 0; if st1>st2 then 1)
   static cmp(st1, st2, b = false) {
      if (b) {
         let ccnf = this.cmpcnf(this.cnf(st1), this.cnf(st2));
         let c = st1 == st2 ? 0 : [...st1].reverse() > [...st2].reverse() ? 1 : -1;
         if (ccnf != c)
            return ccnf;
         return c;
      }
      return st1 == st2 ? 0 : [...st1].reverse() > [...st2].reverse() ? 1 : -1;
   }

   // delete all boosters of b < b, add a booster
   static bbc(a, b) {
      while (b != '' && b != this.col && this.cmp(a, this.booster(b)) == 1)
         b = this.base(b);
      return this.bb(a, b);
   }

   static rest(l, st) {
      return this.cmp(l, st) == 1 ? st : this.rest(l, this.booster(st));
   }

   static ceill(l, st) {
      return this.cmp(l, st) == 1 ? l : this.bbc(this.ceill(l, this.booster(st)), st);
   }

   static ledge(st) {
      let x = this.booster(st);
      return this.cmp(this.col, x) == 1 ? this.col : this.bbc(this.ceill(this.col, x), this.base(st));
   }

   static cascade(x, c, st) {
      let y = this.booster(c);
      let d = this.cof(y);
      let s = d == this.col || d == this.ledge(c) ? this.bb(this.fs(y, this.rest(d, x)), this.base(c)) : this.cascade(y, d, c);
      return this.bb(this.fs(x, s), this.base(st));
   }

   // get cofinality of ordinal st
   static cof(st) {
      if (st == this.bo)                         // L
         return '[[]]';
      else if (st == '' || st == this.col)            // 1, 6
         return st;
      else {
         let x = this.booster(st);
         if (x == '')                       // 2
            return '[]';
         else {
            let c = this.cof(x);
            if (c == '[]')                // 3
               return '[[]]';
            else if (c == '[[]]' || this.cmp(st, c) == 1)       // > C
               return c;
            else {
               let l = this.ledge(st);
               if (this.cmp(l, c) < 1)
                  return st;                    // 7
               else {
                  let ca = this.cmp(this.bbc(this.ceill(l, x), this.base(st)), c);
                  if (ca == 1)   // 4, 5, 8
                     return c;
                  else if (ca == 0)
                     return '[[]]';
                  else
                     return this.cof(this.cascade(x, c, st));
               }
            }
         }
      }
   }

   static expanlimit(n) {
      let result = `[${'c'}]`;
      for (let i = 0; i < n; i++) {
         result = `[${result}${'c'}]`;
      }
      return '[' + result + ']';
   }

   static tostring(n) {
      return "[".repeat(n) + "]".repeat(n);
   }

   // get n-th element of fs of ordinal st
   static fs(st, n) {
      if (st == "Limit") return this.expanlimit(n);
      if (typeof n == "number") n = this.tostring(n);
      if (st == this.bo) {
         let s = this.col;
         for (let i = 0; i < this.fostn(n); i++)
            s = this.bb(s, this.col);
         for (let i = 0; i < 2; i++)
            s = this.bb(s, '');
         return s;
      }
      else if (st == '' || st == this.col)     // 1, 6
         return n;
      else {
         let x = this.booster(st);
         let beta = this.base(st);
         if (x == '')                         // 2
            return beta;
         else {
            let c = this.cof(x);
            if (c == '[]') {                    // 3
               let s = beta;
               x = this.pred(x);
               for (let i = 0; i < this.fostn(n); i++)
                  s = this.bb(x, s);
               return s;
            }
            else if (c == '[[]]' || this.cmp(st, c) == 1)     // > C
               return this.bb(this.fs(x, n), beta);
            else {
               let l = this.ledge(st);
               if (this.cmp(l, c) < 1)       // 7
                  return n;
               else {
                  let ca = this.cmp(this.bbc(this.ceill(l, x), this.base(st)), c);
                  if (ca == 1)                   // 4, 5, 8
                     return this.bb(this.fs(x, n), beta);
                  else if (ca == 0) {              // 9
                     let s = beta;
                     for (let i = 0; i < this.fostn(n); i++)
                        s = this.bb(this.fs(x, s), beta);
                     return s;
                  }
                  else
                     return this.fs(this.cascade(x, c, st), n);
               }
            }
         }
      }
   }

   static minimize(st) {
      let s = st;
      if (st == this.bo)                         // L
         s = st;
      else if (st == '' || st == this.col)            // 1, 6
         s = st;
      else {
         let x = this.booster(st);
         if (x == '')                       // 2
            s = st;
         else {
            let c = this.cof(x);
            if (c == '[]')                // 3
               s = st;
            else if (c == '[[]]' || this.cmp(st, c) == 1)       // > C
               s = st;
            else {
               let l = this.ledge(st);
               if (this.cmp(l, c) < 1)
                  s = st;                    // 7
               else {
                  let ca = this.cmp(this.bbc(this.ceill(l, x), this.base(st)), c);
                  if (ca == 1)   // 4, 5, 8
                     s = st;
                  else if (ca == 0)
                     s = st;
                  else {
                     s = this.cascade(x, c, st);
                  }
               }
            }
         }
      }
      return s;
   }

   // is st ε number
   static isepsilon(st) {
      return st == '' ? false : st == this.col || st == this.bo ? true : this.cmp(st, this.booster(st)) < 1;
   }

   // largest ε member ≤ CNF st (if st < ε_0 then '')
   static floorepsilon(st) {
      if (!Array.isArray(st))
         return st;
      let t = st[st.length - 1][0];
      while (Array.isArray(t) && t != 0) {
         st = t;
         t = st[st.length - 1][0];
      }
      return t;
   }

   // is st Ω number
   static isOmega(st) {
      return st == '' ? false : st == this.col || st == this.bo ? true : this.cmp(this.col, this.booster(st)) < 1;
   }

   // remove boosters of st < c
   static floorOmega(st, c = this.col) {
      while (st != '' && st != this.col && st != c && this.cmp(c, this.booster(st)) == 1)
         st = this.base(st);
      return st;
   }

   // largest Ω number ≤ CNF st (if st < Ω then '')
   static floorOmegacnf(st) {
      if (st == '')
         return '';
      let t = this.floorepsilon(st);
      while (!this.isOmega(t)) {
         st = t;
         t = this.floorepsilon(st);
      }
      return t;
   }

   static sepsilon(st, e) {
      let s = st[st.length - 1];
      if (s[0] == e)
         if (s[1] == 1)
            st.pop();
         else
            s[1]--;
      return st.length ? st : '';
   }

   static braintail(st, e) {
      let i = 0, s = [];
      while (this.floorepsilon([st[i]]) != e)
         i++;
      let u = i;
      while (i < st.length) {
         s.push([st[i][0] == e ? '' : this.sepsilon(st[i][0], e), st[i][1]]);
         i++;
      }
      let tail = st.slice(0, u);
      if (!tail.length)
         tail = '';
      else if (tail.length == 1 && tail[0][1] == 1 && tail[0][0] != '' && !Array.isArray(tail[0][0]))
         tail = tail[0][0];
      return [s, tail];
   }

   // ω ^ CNF st
   static omegapower(st) {
      if (st != '' && !Array.isArray(st))
         return st;
      return [[st, 1]];
   }

   // cmp CNFs st1, st2 (if st1<st2 then -1; if st1=st2 then 0; if st1>st2 then 1)
   static cmpcnf(st1, st2) {
      if (st1.toString() == st2.toString())
         return 0;
      if (st1 == '')
         return -1;
      if (st2 == '')
         return 1;
      let b1 = !Array.isArray(st1);
      let b2 = !Array.isArray(st2);
      if (b1 && b2)
         return this.cmp(st1, st2);
      let c;
      if (b1) {
         c = this.cmp(st1, this.floorepsilon(st2));
         return c == 0 ? -1 : c;
      }
      if (b2) {
         c = this.cmp(this.floorepsilon(st1), st2);
         return c == 0 ? 1 : c;
      }
      let i1 = st1.length - 1;
      let i2 = st2.length - 1;
      do {
         if (st1[0].length == 2 && st2[0].length == 2) {
            c = this.cmpcnf(st1[i1][0], st2[i2][0]);
            if (c != 0)
               return c;
            c = st1[i1][1] > st2[i2][1] ? 1 : st1[i1][1] < st2[i2][1] ? -1 : 0;
         }
         else {
            c = this.cmp(st1[i1][0], st2[i2][0]);
            if (c != 0)
               return c;
            c = this.cmpcnf(st1[i1][1], st2[i2][1]);
            if (c != 0)
               return c;
            c = this.cmpcnf(st1[i1][2], st2[i2][2]);
         }
         if (c != 0)
            return c;
         i1--;
         i2--;
      }
      while (i1 >= 0 && i2 >= 0);
      if (i1 < 0)
         return -1;
      return 1;
   }

   // CNF st1 + CNF st2 
   static sumcnf(st1, st2) {
      if (st1 == '')
         return st2;
      if (st2 == '')
         return st1;
      let z1, z2;
      if (!Array.isArray(st1)) {
         z1 = st1;
         st1 = [[st1, 1]];
      }
      if (!Array.isArray(st2)) {
         z2 = st2;
         st2 = [[st2, 1]];
      }
      let b1 = st1[0].length == 2;
      let b2 = st2[0].length == 2;
      if (b1 ^ b2) {
         if (b1)
            st1 = [[z1 === undefined ? this.floorepsilon(st1) : z1, '', st1]];
         else
            st2 = [[z2 === undefined ? this.floorepsilon(st2) : z2, '', st2]];
      }
      let s = st2.slice(-1);
      let i = 0;
      if (b1 && b2) {
         let c = this.cmpcnf(s[0][0], st1[i][0]);
         while (c > 0) {
            i++;
            if (i < st1.length)
               c = this.cmpcnf(s[0][0], st1[i][0]);
            else
               break;
         }
         if (i == st1.length)
            return st2;
         if (c == 0) {
            st1[i][1] += s[0][1];
            st2.pop();
         }
      }
      else {
         let c0 = this.cmp(s[0][0], st1[i][0]);
         let c1 = this.cmpcnf(s[0][1], st1[i][1]);
         while (c0 > 0 || (c0 == 0 && c1 > 0)) {
            i++;
            if (i < st1.length) {
               c0 = this.cmp(s[0][0], st1[i][0]);
               c1 = this.cmpcnf(s[0][1], st1[i][1]);
            }
            else
               break;
         }
         if (i == st1.length)
            return st2;
         if (c0 == 0 && c1 == 0) {
            st1[i][2] = this.sumcnf(st1[i][2], s[0][2]);
            st2.pop();
         }
      }
      return st2.concat(st1.slice(i));
   }

   // get CNF of st
   static cnf(st, ext = false, b = true) {
      if (!Array.isArray(st) && (st == '' || this.isepsilon(st)))
         return st;
      let c = [];
      if (ext) {
         if (!Array.isArray(st))
            st = this.cnf(st);
         if (this.floorepsilon(st) == '')
            return st;
         let s, t, i = -1, e, brain, m, h;
         for (s of st) {
            h = false;
            e = this.floorepsilon([s]);
            if (e == '') {
               brain = '';
               m = s;
            }
            else if (s[0] == e) {
               brain = '';
               m = ['', s[1]];
            }
            else {
               [brain, t] = this.braintail(s[0], e);
               if (brain.length == 1 && !brain[0][0].length && brain[0][1] == 1)
                  brain = '';
               m = [t, s[1]];
               h = t != '' && s[1] == 1 && !Array.isArray(t);
            }
            if (i < 0 || c[i][0] != e || c[i][1].toString() != brain.toString()) {
               c.push([e, brain, h ? t : [m]]);
               i++;
            }
            else {
               if (!Array.isArray(c[i][2]))
                  c[i][2] = [[c[i][2], 1]];
               c[i][2].push(m);
            }
         }
         if (b)
            for (s of c) {
               s[1] = this.cnf(s[1], true);
               s[2] = this.cnf(s[2], true);
            }
      }
      else {
         let s, t, i = -1;
         while (st) {
            [s, st] = this.isepsilon(st) ? [st, ''] : [this.booster(st), this.base(st)];
            if (c.length == 0 || this.cmp(t, s) < 1) {
               if (i < 0 || c[i][0] != s) {
                  c.push([s, 1]);
                  i++;
               }
               else
                  c[i][1]++;
               t = s;
            }
         }
         for (s of c)
            s[0] = this.cnf(s[0]);
      }
      return c;
   }

   static unone(st) {
      return st == '1' ? '' : st;
   }

   static displayform(st, ext = false) {
      if (st == '')
         return 0;
      if (!Array.isArray(st))
         return this.convertepsilon(st, ext);
      if (ext) {
         if (st[0].length == 2)
            return this.displayform(st);
         let i = st.length - 1;
         let s = '';
         let e, ex, m;
         while (i >= 0) {
            s += ' + ';
            e = st[i][0];
            if (e == '')
               s += this.displayform(st[i][2]);
            else {
               s += this.convertepsilon(e, true);
               ex = st[i][1];
               m = this.displayform(st[i][2], true);
               if (Array.isArray(st[i][2]) && st[i][2].length > 1)
                  m = '<span style="color: #666666; font-weight: bold;">(</span>' + m + '<span style="color: #666666; font-weight: bold;">)</span>';
               else
                  m = this.unone(m);
               if (ex != '')
                  s += '<sup>' + this.displayform(ex, true) + '</sup>';
               else if (m && (s[s.length - 1] == ']' || m[0] == '['))
                  s += '·';
               s += m;
            }
            i--;
         }
         return s.slice(3);
      }
      else {
         let i = st.length - 1;
         let s = '';
         let ex;
         while (i >= 0) {
            s += ' + ';
            ex = st[i][0];
            if (Array.isArray(ex)) {
               s += '<span style="color: #ff0000; font-weight: bold;">ω</span>';
               if (ex.length != 1 || ex[0][0] != 0 || ex[0][1] != 1)
                  s += '<sup>' + this.displayform(ex) + '</sup>';
               s += this.unone(st[i][1]);
            }
            else if (ex == '')
               s += st[i][1];
            else {
               s += this.convertepsilon(ex);
               if (st[i][1] != '1') {
                  if (s[s.length - 1] == ']')
                     s += '·';
                  s += st[i][1];
               }
            }
            i--;
         }
         return s.slice(3);
      }
   }

   static getle(cf, x, ex, b) {
      let le = '';
      if (b) {
         let u = 0;
         while (this.cmpcnf(cf, [ex[u]]) > 0)
            u++;
         if (u > 0)
            le = ex.slice(0, u);
      }
      if (le.length == 1 && le[0][1] == 1 && le[0][0] != '' && !Array.isArray(le[0][0]))
         return le[0][0];
      else
         return this.omegapower(le);
   }

   static convertepsilon(st, ext = false) {
      if (st == this.col || st == this.bo)
         return st;

      if (st == '[[[[c]c]]c]')
         return '<span style="color: #707070; font-weight: bold;">I</span>';
      if (st == '[[[c][[c]c]]c]')
         return '<span style="color: #1900ff; font-weight: bold;">M</span>';

      let x = this.booster(st);
      let beta = this.base(st);

      let f = this.floorOmega(x);
      let j = f;
      let sy = '';
      if (f == this.col) {
         sy = 'Ω';
         j = this.bb(this.col, this.col);
         j = this.bb(j, this.floorOmega(beta, j));
         j = this.bb(j, this.col);
         j = this.bb(j, this.floorOmega(beta, j));
      }
      else if (f == this.bb(this.col, this.col)) {
         sy = 'L';
         j = this.bb(this.col, this.col);
         j = this.bb(this.col, j);
         j = this.bb(j, this.floorOmega(beta, j));
         j = this.bb(j, this.col);
         j = this.bb(j, this.floorOmega(beta, j));
      }
      else if (f == this.bb(this.col, this.bb(this.col, this.col))) {
         sy = 'R';
         j = this.bb(this.col, this.col);
         j = this.bb(this.col, j);
         j = this.bb(this.col, j);
         j = this.bb(j, this.floorOmega(beta, j));
         j = this.bb(j, this.col);
         j = this.bb(j, this.floorOmega(beta, j));
      }
      else {
         if (f == this.bb(this.col, this.floorOmega(beta)))
            sy = 'φ';
      }
      if (sy != '' && this.cmp(this.bb(this.bb(this.bb('', f), f), f), x) > 0 && (sy != 'Ω' || this.cmp(this.bb(j, this.col), x) == 1)) {
         let cf = this.cnf(f);
         let fx = this.floorOmega(x, f);
         let ex = this.cnf(x);
         let eex = this.cnf(ex, true, false);
         let le = this.getle(cf, x, ex, x != f && eex[0][0] != f);
         while (beta) {
            let x1 = this.booster(beta);
            let fx1 = this.floorOmega(x1, j);
            if (fx1 == fx) {
               let ex1 = this.cnf(x1);
               le = this.sumcnf(this.getle(cf, x1, ex1, x1 != j && this.cnf(ex1, true, false)[0][0] != j), le);
               beta = this.base(beta);
            }
            else {
               if (fx == f)
                  le = this.sumcnf(beta, le);
               else {
                  let u = eex.length - 1;
                  while (u >= 0 && eex[u][0] == f)
                     u--;
                  u++;
                  let ca = this.cmpcnf(eex[u][2], this.cnf(beta));
                  le = this.sumcnf(ca == 1 ? '' : ca == 0 ? [['', 1]] : beta, le);
               }
               break;
            }
         }
         if (sy != 'φ' && le.length == 1 && le[0][1] == 1 && le[0][0] == '')
            le = '';
         else {
            if (ext)
               le = this.cnf(le, true);
            le = this.displayform(le, ext);
            if (sy == 'φ' && isFinite(le))
               le--;
         }

         if (sy == 'φ') {
            if (fx == f)
               return '<span style="color: #00832c; font-weight: bold;">ε</span><sub>' + le + '</sub>';
            if (fx == this.bb(f, f))
               return '<span font-weight: bold;">ζ</span><sub>' + le + '</sub>';
            if (fx == this.bb(f, this.bb(f, f)))
               return '<span font-weight: bold;">η</span><sub>' + le + '</sub>';
            if (fx == this.bb(this.bb(f, f), f))
               return '<span style="color: #ff00ea; font-weight: bold;">Γ</span><sub>' + le + '</sub>';
         }

         if (sy != 'φ' || fx == f) {
            let coloredSy = sy;
            if (sy == 'Ω') coloredSy = '<span style="color: #001aff; font-weight: bold;">Ω</span>';
            if (sy == 'L') coloredSy = '<span font-weight: bold;">L</span>';
            if (sy == 'R') coloredSy = '<span font-weight: bold;">R</span>';
            return coloredSy + (le == '' ? '' : '<sub>' + le + '</sub>');
         }

         let s = '';
         let i = eex.length - 1;
         let p = eex[i][1];
         let m = eex[i][2];
         p = p == '' ? 1 : p[0][1];
         let q = p;
         while (q > 0) {
            s += ', ';
            if (q == p) {
               i--;
               if (ext)
                  m = this.cnf(m, true);
               s += this.displayform(m, ext);
               if (i >= 0) {
                  p = eex[i][1];
                  m = eex[i][2];
                  p = eex[i][0] != f ? 0 : p == '' ? 1 : p[0][1];
               }
            }
            else
               s += 0;
            q--;
         }

         let coloredSy = sy;
         if (sy == 'φ') coloredSy = '<span style="color: #4d4d4d; font-weight: bold;">φ</span>';
         return coloredSy + '<span style="color: #777;">(</span>' + s.slice(2) + ', ' + le + '<span style="color: #777;">)</span>';
      }
      return this.bb(this.displayform(this.cnf(x, ext), ext), beta == '' ? '' : (this.displayform(this.cnf(beta, ext), ext)));
   }

   static convert(st) {
      let d = this.format > 1 ? st : this.displayform(this.cnf(st, this.format), this.format);
      if (this.mf) {
         let s = this.minimize(st);
         while (s != st) {
            d = d + ' = ' + (this.format > 1 ? s : this.displayform(this.cnf(s, this.format), this.format));
            st = s;
            s = this.minimize(st);
         }
      }
      return d;
   }

   static isSuccessor(ord) {
      if (ord == "Limit") return false;
      return (this.cof(ord) == '[]') ? true : false;
   }

   static f(alpha, beta) {
      let n = 0;

      while (true) {
         const x = this.fs(beta, n);

         if (this.cmp(x, alpha) > 0) {
            return x;
         }

         n++;
      }
   }

   static g(alpha, beta, s) {
      while (true) {
         if (this.isSuccessor(beta)) return alpha;

         const split = this.f(alpha, beta);

         if (s === "") return split;

         const bit = s[0];
         s = s.slice(1);

         if (bit === "0") {
            beta = split;
         } else {
            alpha = split;
         }
      }
   }

   static gInv(alpha, beta, target) {
      let result = "";

      while (!this.isSuccessor(beta)) {
         const split = this.f(alpha, beta);
         const c = this.cmp(target, split);

         if (c === 0) break;

         if (c < 0) {
            result += "0";
            beta = split;
         } else {
            result += "1";
            alpha = split;
         }
      }

      return result;
   }

   static h(x, k = 0.5, maxlen = 100, eps = 1e-10) {
      let result = "";

      while (Math.abs(x - k) > eps && result.length < maxlen) {
         if (x < k) {
            result += "0";
            x = x / k;
         } else {
            result += "1";
            x = (x - k) / (1 - k);
         }
      }

      return result;
   }

   static hInv(s, k = 0.5) {
      let x = k;

      for (let i = s.length - 1; i >= 0; i--) {
         if (s[i] === "0") {
            x = k * x;
         } else {
            x = k + (1 - k) * x;
         }
      }

      return x;
   }
}

function Conv_cOCF_BMS(ord) {
   if (cOCF.cmp(ord, '[[c]]') == -1)
      return BMS.g(BMS.ZERO, [[0, 0], [1, 1]], cOCF.gInv(cOCF.ZERO, "[[c]]", ord))

   if (cOCF.cmp(ord, '[[[]c]]') == -1)
      return BMS.g([[0, 0], [1, 1]], [[0, 0, 0], [1, 1, 1]], cOCF.gInv("[[c]]", "[[[]c]]", ord))

   if (cOCF.cmp(ord, '[[[][c]c]]') == -1)
      return BMS.g([[0, 0, 0], [1, 1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1]], cOCF.gInv("[[[]c]]", "[[[][c]c]]", ord))

   return BMS.g([[0, 0, 0, 0], [1, 1, 1, 1]], Lim_cOCF_in_BMS, cOCF.gInv("[[[][c]c]]", 'Limit', ord))
}

function Conv_BMS_cOCF(ord) {
   if (BMS.cmp(ord, [[0, 0], [1, 1]]) == -1)
      return cOCF.g(cOCF.ZERO, "[[c]]", BMS.gInv(BMS.ZERO, [[0, 0], [1, 1]], ord))

   if (BMS.cmp(ord, [[0, 0, 0], [1, 1, 1]]) == -1)
      return cOCF.g("[[c]]", "[[[]c]]", BMS.gInv([[0, 0], [1, 1]], [[0, 0, 0], [1, 1, 1]], ord))

   if (BMS.cmp(ord, [[0, 0, 0, 0], [1, 1, 1, 1]]) == -1)
      return cOCF.g("[[[]c]]", "[[[][c]c]]", BMS.gInv([[0, 0, 0], [1, 1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1]], ord))

   return cOCF.g("[[[][c]c]]", "Limit", BMS.gInv([[0, 0, 0, 0], [1, 1, 1, 1]], Lim_cOCF_in_BMS, ord))
}

const EcOCF = (() => {

   function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
   }

   window.addEventListener("keydown", function (e) {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
         e.preventDefault();
      }
   }, false);

   function mod(n, m) {
      return (n % m + m) % m;
   }

   // get position of last symbol '[' of string st
   function getls(st) {
      let e = st.length;
      let np = 0;
      while ((e > -1) && (np != 0 || st[e] != '[')) {
         e--;
         if (st[e] == '[') np--;
         else if (st[e] == '!') np++;
      }
      return e;
   }

   // get position of first symbol '!' of string st
   function getfs(st) {
      let e = -1;
      let np = 0;
      while ((e < st.length) && (np != 0 || st[e] != '!')) {
         e++;
         if (st[e] == '[') np--;
         else if (st[e] == '!') np++;
      }
      return e;
   }

   // create base]booster[ string
   function bb(base, booster) {
      return base + '[' + booster + '!';
   }

   // get base of string st
   function base(st) {
      return st.slice(0, getls(st));
   }

   // get booster of string st
   function booster(st) {
      return st.slice(getls(st) + 1, -1);
   }

   function antibb(antibooster, antibase) {
      return '[' + antibooster + '!' + antibase;
   }

   function antibase(st) {
      return st.slice(getfs(st) + 1);
   }

   function antibooster(st) {
      return st.slice(1, getfs(st));
   }

   // get predecessor of successor ordinal st = X + 1
   function pred(st) {
      return st.slice(0, -2);
   }

   // compare expressions st1, st2 (if st1<st2 then -1; if st1==st2 then 0; if st1>st2 then 1)
   //function compare(st1,st2,b=false){
   function compare(st1, st2) {
      return st1.localeCompare(st2);
   }

   function cmp(st1, st2) {
      return st1.localeCompare(st2);
   }

   function ocd(st) {
      let n = 0;
      for (let s of st) {
         if (s == '[') { n++ }
         else if (s == '!') { n-- }
      }
      return n;
   }

   function getpos(st) {
      let n = 0;
      let pcar = [];
      let l = st.length;
      let l2 = 2 * l;
      st = st + st;
      let e = 0;
      while (e < l2) {
         if (pcar.length) {
            if (st[e] == '[') {
               n++;
               if (n == 2) {
                  pcar.push(e);
                  n = 1;
               }
            }
            else if (st[e] == '!') {
               n--;
               if (n <= 0) {
                  pcar.pop();
                  n++;
               }
            }
         }
         else {
            if (st[e] == '[') {
               pcar.push(e);
               n = 1;
            }
         }
         e++;
      }
      e = 0;
      while (pcar.length > 2 && pcar.at(-2) >= l)
         pcar.pop();
      let m = pcar.at(-1) - l;
      while (pcar[e] < m)
         e++;
      m = pcar.length - 1;
      if (e + 1 == m)
         return pcar[e];

      let psar = [];
      for (let i = e; i < m; i++)
         psar.push(st.slice(pcar[i], pcar[i + 1]));
      let b = true;
      for (let i = e + 1; i < m; i++)
         if (psar[i] != psar[e])
            b = false;
      if (b)
         return pcar[e];
      /*for(let i=e+1;i<m;i++)
         {
         let i1=i;
         let e1=e;
         while(psar[i1]==psar[e1])
            {
            i1--;
            e1--;
            if(i1<e)
               i1=pcar.length-1;
            if(e1<e)
               e1=pcar.length-1;
            }
         if(psar[i1]>psar[e1])
            {
            e=i;
            }
         }
      return pcar[e+1]%l;*/

      e = 0;

      let maxp = st.slice(pcar[e], pcar[e] + l);
      for (let i = e + 1; i < m; i++) {
         /*let sm=maxp;
         while(sm&&sm[0]=='[')
            sm=sm.slice(1);
         let ss=st.slice(pcar[i],pcar[i]+l);
         while(ss&&ss[0]=='[')
            ss=ss.slice(1);*/

         //if(ss>sm)
         //if(st.slice(pcar[i],pcar[i]+l)>maxp||ss.slice(0,6)>sm.slice(0,6))
         //if((i-e==1?ss:st.slice(pcar[i],pcar[i]+l))>(i-e==1?sm:maxp))
         //if(ss>sm&&ss!=sm+'['&&ss!=sm+'[[')
         if (st.slice(pcar[i], pcar[i] + l) > maxp)
         //if(st.slice(pcar[i],pcar[i]+l)>maxp&&maxp.slice(0,pcar[i]-pcar[e]).includes(col))
         //if(st.slice(pcar[i],pcar[i]+l).split("").reverse().join("")<maxp.split("").reverse().join(""))
         {
            maxp = st.slice(pcar[i], pcar[i] + l);
            e = i;
         }
      }
      //if(e&&pcar[e]-pcar[e-1]==1&&pcar[0]<2&&pcar.length>3)
      //   e--;
      if (m == 2)
         e++;
      else
         //if(st.includes(col))
         //while(e&&st.slice(pcar[e]%l+l-2,pcar[e]%l+l)=='[[')
         //while(e&&(st.slice(pcar[e]%l+l-2,pcar[e]%l+l)=='[['||(e==pcar.length-2&&st.slice(pcar[e]%l+l-1,pcar[e]%l+l)=='[')))
         if (maxp > '[c') {
            if (e && pcar[e] - pcar[e - 1] == 1)
               e--;
            //while(e>1&&pcar[e]-pcar[e-1]==1)                              // July 2024 version
            while (e > 1 && pcar[e] - pcar[e - 1] == 1 && pcar[e - 1] - pcar[e - 2] == 1)    // December 2024 version
               e--;
         }

      return pcar[e] % l;
   }

   function overperiod(st) {
      if (st[0] != col)
         return st;
      let i = 0;
      for (let e = 1; e < st.length; e++)
         if (st.slice(0, e) == st.slice(-e))
            i = e;
      return i ? st.slice(0, -i) : st;
   }

   function overperiod_new(st) {
      let b = true;
      while (b) {
         if (st[0] != col)
            return st;
         let i = 0;
         for (let e = 1; e < st.length; e++)
            if (st.slice(0, e) == st.slice(-e))
               i = e;
         if (i)
            st = st.slice(0, -i);
         else
            b = false;
      }
      return st;
   }

   function overperiod2(st) {
      let a = [];
      for (let i = 0; i < st.length; i++)
         if (st[i] == col)
            a.push(i);
      let l = a.length;
      if (l < 2)
         return st;
      for (let i = 0; i < l; i++)
         a.push(a[i] + st.length);
      let st2 = st + st;
      let aa = Array(l);
      for (let e = 0; e < l; e++)
         aa[e] = Array(l);
      //aa.fill(Array(l));
      aa.forEach(function (i) { i.fill(false); });
      for (let e = 0; e < l - 1; e++)
         for (let i = e + 1; i < l; i++)
            if (st2.slice(a[e], a[i]) == st2.slice(a[i], a[2 * i - e]))
               aa[e][i] = true;
      let i = l - 1;
      let e = 0;
      while (i) {
         let u = e + i;
         if (u < l && aa[e][u])
            return st.slice(0, e) + st.slice(u);
         e++;
         if (e >= l) {
            i--;
            e = 0;
         }
      }
      return st;
   }

   function overprimer(st, st0) {
      if (st[0] != col)
         return st0;
      let i = 0;
      for (let e = 1; e < st.length; e++)
         if (st.slice(0, e) == st0.slice(-e))
            i = e;
      return i ? st0.slice(0, -i) : st0;
   }

   function overprimer_new(st, st0) {
      let b = true;
      while (b) {
         if (st[0] != col)
            return st0;
         let i = 0;
         for (let e = 1; e < st.length; e++)
            if (st.slice(0, e) == st0.slice(-e))
               i = e;
         if (i)
            st0 = st0.slice(0, -i);
         else
            b = false;
      }
      return st0;
   }

   function setfsarrays() {
      fsnumber = 1;
      fsopeningarray = [fsopening];
      fsperiodarray = [fsperiod0];
      fsendingarray = [fsending];
      let i = fsending.length;
      let u = fsperiod1.length;
      let j = fsperiod0.length;
      let y = fsopening.length;
      let q = j - 1;
      while (fsperiod0[q] == '!')
         q--;
      let b = true;
      for (let e = 1; e <= q; e++) {
         let a = fsperiod0[e - 1];
         if (a == '[')
            i++;
         else if (a == '!')
            i--;
         if (fsperiod0[e] != '!') {
            fsopeningarray.push(fsopening + fsperiod0.slice(0, e));
            if (!b)
               fsopeningarray[fsnumber] = fsopeningarray[fsnumber].slice(0, -j);
            fsperiodarray.push(fsperiod0.slice(e) + fsperiod0.slice(0, e));
            if (b && y + e >= j && fsopeningarray[fsnumber].slice(-j) == fsperiodarray[fsnumber]) {
               fsopeningarray[fsnumber] = fsopeningarray[fsnumber].slice(0, -j);
               i -= u;
               b = false;
            }
            fsendingarray.push('!'.repeat(i));
            if (fsperiod0[e] == col) {
               fsopeningarray.push(fsopeningarray[fsnumber]);
               fsperiodarray.push(fsperiodarray[fsnumber]);
               fsendingarray.push('[!' + fsendingarray[fsnumber]);
               fsnumber++;
            }
            fsnumber++;
         }
      }
   }

   // left non-empty base
   function leftbase(st) {
      let beta = base(st);
      return beta ? leftbase(beta) : st;
   }

   // if st is not epsilon: -1
   // epsilon: 0
   // Omega: 1
   // L: 2
   // R: 3
   // ...
   function getepslevel(st) {
      if (st == bo)
         return 0;
      if (!st)
         return -1;
      if (st == col)
         return nlevels;
      let x = booster(st);
      if (st > x)
         return -1;
      return getepslevel(leftbase(x)) - 1;
   }

   function flooreps(st, n = 0) {
      if (!st || getepslevel(st) >= n)
         return st;
      return flooreps(base(st), n);
   }

   // n = 0: least epsilon above st
   // n = 1: least Omega above st
   // n = 2: least L above L st
   //...
   function nexteps(st, n = 0) {
      if (st >= col || n > nlevels)
         return 'd';
      if (n == nlevels)
         return col;
      return bb(flooreps(st, n), nexteps(st, n + 1));
   }

   function nextzeta(st, n = 0) {
      if (st >= col || n >= nlevels)
         return 'd';
      let e = nexteps(st, n + 1)
      e = bb(e, e);
      while (st && booster(st) < e)
         st = base(st);
      return bb(st, e);
   }

   function card(st) {
      if (st == col)
         if (nlevels) {
            cardclass = 2;
            return col;
         }
         else {
            cardclass = 1;
            return '[[!!';
         }
      if (st == bo) {
         if (uncountablemode) {
            cardclass = 2;
            return st;
         }
         else {
            cardclass = 1;
            return '[[!!';
         }
      }
      if (st < '[[!!') {
         cardclass = 0;
         return st;
      }
      if (st < leastuncountable) {
         cardclass = 1;
         return '[[!!';
      }

      cardclass = 2;
      while (st.length > 1 && st > booster(st))
         st = base(st);
      return st;
   }

   // card, but if < Ω, returns empty string
   function ecard(st) {
      let c = card(st);
      if (c < leastuncountable)
         return '';
      return st;
   }

   /*function getnin(st){
   if(st.length<2||st==bo)
      return 0;
   let x=booster(st);
   return Math.max(getnin(base(st)),(x>st?1:0)+getnin(x));
   }*/

   /*function infcompare(st1,st2)
   {
   if(st1.length>st2.length)
      while(st1.length>st2.length)
         st2+=st2;
   else if(st1.length<st2.length)
      while(st1.length<st2.length)
         st1+=st1;
   return st1>=st2;
   }*/

   function infcompare(pr1, per1, pr2, per2) {
      if (pr1 == pr2 && per1 == per2)
         return true;
      let st1 = pr1 + per1;
      let st2 = pr2 + per2;
      let m = Math.max(st1.length, st2.length) * 2;
      let l = Math.min(st1.length, st2.length);
      while (st1.slice(0, l) == st2.slice(0, l)) {
         if (l > m)
            return true;
         let c = Math.sign(st1.length - st2.length);
         if (c >= 0)
            st2 += per2;
         if (c <= 0)
            st1 += per1;
         l = Math.min(st1.length, st2.length);
      }
      return st1 >= st2;
   }

   // check are booster non-increasing (partial case of standardness)
   function checkboosters(st) {
      if (st.length < 2)
         return true;
      let a = base(st);
      if (a.length < 2)
         return checkboosters(booster(st));
      let b = booster(st);
      if (b > booster(a))
         return false;
      return checkboosters(a) && checkboosters(b);
   }

   // get primer and period from st
   // primer ends and period starts at the same point
   function getprper(st) {
      let pr = '';
      let per = st;
      let s = st + col;
      let p = '!'.repeat(ocd(st));
      for (let e = st.length; e > 0; e--)
         for (let i = 0; i <= st.length - e; i++) {
            let pr1 = st.slice(0, i);
            let per1 = st.slice(i, i + e);
            let n = ocd(per1);
            if (n > 0 && infcompare(s, p, pr1, per1) && checkboosters(pr1 + per1 + '!'.repeat(ocd(pr1) + n)) && infcompare(pr1, per1, pr, per))
               [pr, per] = [pr1, per1];
         }
      return [pr, per];
   }

   // get primer and period from st
   function getprper_old2(st) {
      let pr = '';
      let per = st;
      let s = st + col;
      let p = '!'.repeat(ocd(st));
      for (let e = st.length; e > 0; e--)
         for (let i = 0; i <= st.length - e; i++)
            for (let y = 0; y <= st.length; y++) {
               let pr1 = st.slice(0, y);
               let per1 = st.slice(i, i + e);
               let n = ocd(per1);
               if (n > 0 && infcompare(s, p, pr1, per1) && checkboosters(pr1 + per1 + '!'.repeat(ocd(pr1) + n)) && infcompare(pr1, per1, pr, per))
                  [pr, per] = [pr1, per1];
            }
      return [pr, per];
   }

   function getprper1(st) {
      let pr = '';
      let per = st;
      let s = st + col;
      let p = '!'.repeat(ocd(st));
      let l = st.length;
      st += st;
      for (let e = l; e > 0; e--)
         for (let i = 0; i < l; i++) {
            let pr1 = st.slice(0, i);
            let per1 = st.slice(i, i + e);
            let n = ocd(per1);
            if (per1[0] != col || per1.at(-1) == '[')
               if (n > 0 && infcompare(s, p, pr1, per1) && checkboosters(pr1 + per1 + '!'.repeat(ocd(pr1) + n)) && infcompare(pr1, per1, pr, per))
                  [pr, per] = [pr1, per1];
         }
      return [pr, per];
   }

   // get n-th element of fs of ordinal st
   function fs_old(st, n, nn = 0) {

      //let nin=getnin(st);
      //if(nin>4)
      //   alert(st+'\n'+convert(st)+'\nnin = '+nin);

      // optimization
      if (st == fscurrent)
         //return fsopening+(fsperiod0.repeat(nn))+(fsperiod1.repeat(nn)+fsending);
         return fsopeningarray[subperiodpositionshift] + (fsperiodarray[subperiodpositionshift].repeat(nn)) + (fsperiod1.repeat(nn) + fsendingarray[subperiodpositionshift]);

      if (fscurrent)
         subperiodpositionshift = 0;

      fscurrent = st;
      cblen = 0;
      cbc = 0;
      cpn = 0;

      // limit rule
      if (st == bo) {
         cofcurrent = st;
         cofclass = 3;

         if (uncountablemode) {
            //uncountable
            fsopening = col;
            fsperiod0 = '[' + col;
            fsperiod1 = '!';
            fsending = '';
            setfsarrays();
            return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
         }
         else {
            //countable
            fsopening = nlevels ? '['.repeat(nlevels - 1) : col;
            fsperiod0 = '[' + col;
            fsperiod1 = '!';
            fsending = nlevels ? '!'.repeat(nlevels - 1) : '';
            setfsarrays();
            return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
         }
      }

      let i = st.length - 1;
      while (st[i] == '!')
         i--;
      let e = st[i] == '[';
      let st0 = st.slice(0, i);
      let st1 = st.slice(i + (e ? 2 : 1));
      let s1;

      // successor and plain rule
      if (e) {
         st0 += '!';
         cofcurrent = st1 ? '[[!!' : '[!';
         cofclass = st1 ? st == cofcurrent ? 3 : 0 : 2;
         let st2 = st1;
         //s1=bb('',booster(st0));
         s1 = st1 ? bb('', booster(st0)) : '';
         st1 = st1.slice(1);
         fsopening = base(st0);
         fsperiod0 = s1;
         fsperiod1 = '';
         fsending = st1;

         setfsarrays();
         return fsopening + fsperiod0.repeat(nn) + fsending;
      }

      // main rule
      let stt = st0;
      let u = i - 1;

      while (st0[u] == '[')
         u--;
      u = i - u - 1;

      st0 += '[';

      st1 = st1.slice(u);
      let s;

      u++;
      let uo = '['.repeat(u);

      let cb = [st];
      //let nc=[1,1];
      while (cb.at(-1).length > 1) {
         cb.push(booster(cb.at(-1)));
      }

      let nod = 0;
      let mb = col;
      for (i = cb.length - 1; i >= 0; i--)
         if (cb[i] < mb) {
            nod++;
            mb = cb[i];
         }

      let noi = 0;
      mb = st;
      for (i = 0; i < cb.length; i++)
         if (cb[i] > mb) {
            noi++;
            mb = cb[i];
         }

      if (nod > 4 || noi > 4)
         alert(st + '\n' + convert(st) + '\nnod = ' + nod + '\nnoi = ' + noi);

      let pn = cb.length - 1;
      //let lrn=pn;
      let nl = nlevels;
      let lr = 'c';
      let lar = [pn];
      //let r;           // more powerful system
      while (nl) {
         if (cb[pn] < lr) {
            //lrn=pn;
            lr = cb[pn];
            lar.push(pn);
            nl--;

            // more powerful system
            /*let q=base(lr);
            if(lar.length>2&&q!=r)
               {
               nl=0;
               r=q;
               
               let w=booster(lr);                      // new
               while(booster(q)==w)
                  q=base(q);
                  
               while(q.length>1&&booster(q)==col)
                  {
                  q=base(q);
                  nl++;
                  }
               }*/

         }
         else {
            pn--;

            // cof > ω
            if (pn < 0) {
               fsopening = st0.slice(0, -1);
               fsperiod0 = '[' + col;
               while (fsopening.slice(-2) == fsperiod0)
                  fsopening = fsopening.slice(0, -2);
               fsperiod1 = '!';
               fsending = '!'.repeat(ocd(fsopening));
               cofcurrent = lr;
               cofclass = st == cofcurrent ? 3 : 0;
               setfsarrays();
               return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
            }

         }
      }

      //if(st>'[c!')
      //   alert(st);



      // no overlap
      // cb: [[[Xc]]] → X[
      /*for(i=pn;i<cb.length;i++)
         {while(cb[i][0]=='[')
            cb[i]=cb[i].slice(1);
         cb[i]=cb[i].slice(0,-cb.length+i)+'[';
         }
         
      // largest repeated cb
      let np=cb.length-1;
      for(i=cb.length-2;i>=pn;i--)
         if(cb[i]>cb[np].repeat(Math.ceil(cb[i].length/cb[np].length)))
            np=i;*/





      /*let cbase=Array(cb.length*2-pn);
      for(i=pn;i<cb.length;i++)
         {
         cbase[i]=base(cb[i])+'[';
         cbase[i+cb.length-pn]=cbase[i];
         }
      
      for(e=pn;e<cb.length;e++)
         {
         let bar=Array(cb.length).fill(true);
         cb[e]='';
         for(i=pn;i<cb.length;i++)
            cb[e]+=cbase[e+i-pn];
         let bc=cb.length-pn-1;
         let b=true;
         while(bc&&b)
            {
            b=false;
            let i1;
            for(i=e+pn+1;i<e+cb.length;i++)
            if(bar[i])
               {
               let cbc=cbase[e];
               for(u=e+pn+1;u<e+cb.length;u++)
                  if(bar[u]&&u!=i)
                     cbc+=cbase[u];
               if(infcompare(cbc,cb[e]))
                  {
                  b=true;
                  cb[e]=cbc;
                  i1=i;
                  }
               }
            if(b)
               {
               bar[i1]=false;
               bc--;
               }
            }
         }
         
      for(i=pn;i<cb.length;i++)
      if(cb[i].includes(col))
         while(cb[i][0]=='[')
            cb[i]=cb[i].slice(1)+'[';
      else
         cb[i]='[';
      
      
         
      let prover=Array(cb.length);
      for(i=pn;i<cb.length;i++)
         prover[i]=st0;*/



      // overlap
      //let prover=Array(cb.length);

      //let overb=Array(cb.length);

      // cb: [[[Xc]]] → X[
      //for(i=pn;i<cb.length;i++)
      for (i = 0; i < cb.length; i++) {
         /*while(cb[i][0]=='[')
            {cb[i]=cb[i].slice(1);
            }*/
         //cb[i]=cb[i].slice(0,-cb.length+i)+'[';
         cb[i] = cb[i].slice(0, -cb.length + i);
         /*let overper=overperiod(cb[i]);
         if(cb[i]!=overper)
            {
            cb[i]=overperiod(cb[i]);
            overb[i]=true;
            }
         else
            overb[i]=false;
         prover[i]=overprimer(cb[i],st0);*/
      }

      //cb[0]=='c[[c[c!!!![[c[['               // Φ(1, 0)[I]
      //cb[0]=='c[[c[c!!!![['
      //if(st=='[c[[c[c!!!![[c[c!!!')
      //cb[0]='c[[c[c!!!![c[[';
      //cb[0]='[c[[c[c!!!![c[';

      /*c
      c[c!
      [c[c!!
      [c[[c[c!!!![[c[c!!!
      
      c[[c[c!!!![[c[[
      
      [
      c[
      [
      c[[c[c!!!![
      */


      //cb[0]='c![[c[c!!![[c[[';               // Ω[I][I]
      //if(st=='[c![[c[c!!![[c[c!!!')
      //   cb[0]='c[c!!![[c[[';

      /*[
      c[
      [
      c[c!!![
      c![[
      */

      /*let np=cb.length-1;
      for(i=cb.length-2;i>=pn;i--)
      
         if(prover[i].length+cb[i].length>prover[np].length+cb[np].length)
            {
            if(prover[i]+cb[i]>prover[np]+(cb[np].repeat(Math.ceil((prover[i].length-prover[np].length+cb[i].length)/cb[np].length))))
               np=i;
            }
         else
            if(prover[i]+(cb[i].repeat(Math.ceil((prover[np].length-prover[i].length+cb[np].length)/cb[i].length)))>prover[np]+cb[np])
               np=i;
      //np=pn;
      st0=prover[np];*/






      cblen = 1;
      cbc = 1;
      cpn = pn;
      for (i = pn + 1; i < cb.length; i++) {
         if (cb[i] != cb[i - 1])
            cblen++;
         //if(i==np)
         //   cbc=cblen;
      }



      let np = 0;
      let pr;
      let per;
      [pr, per] = getprper(cb[pn]);

      if (st == '[c[[c[c!!!![[c[c!!!')       // Φ(1, 0)[I]
      {
         pr = '[c[[c[c!!!![[c[';            // (original primer [c[ + original period [c[c!!!![[c[)
         per = '[c[c!!!![[c[';              // Ω_{Φ(1, 0) + 1} (original period)
         per = '[c[c!!!![c[[c[';            // Φ(1, 1)
         per = '[c[c!!![[c[';               // Φ(2, 0)
         per = '[c[c!![[c[';                // Φ(1, 0, 0)
         per = '[c[c![[c[';                 // [c + I_...]
         per = '[c[c[[c[';                  // [c + I(..., 0)]
      }

      st0 = st0.slice(0, cb[0].length - cb[pn].length) + pr + per;
      cb[np] = per;





      let shpos = per.indexOf(col);
      //if(pr=='['&&per=='[c[[')
      if (shpos > 0) {
         let shp = per.slice(0, shpos);
         st0 += shp;
         cb[np] = per.slice(shpos) + shp;
      }



      let rr = cb[np].length - getpos(cb[np]);
      while (rr < 0)
         rr += cb[np].length;
      fsopening = st0.slice(0, -rr);
      rr %= cb[np].length;
      fsperiod0 = cb[np].slice(-rr) + cb[np].slice(0, -rr);

      /*if(st=='[c[[c[c!!!![[c[c!!!')
         //fsperiod0.replace('!!!!', '!!!![c');
         fsperiod0=fsperiod0+'[c';*/

      while (fsopening.slice(-fsperiod0.length) == fsperiod0)
         fsopening = fsopening.slice(0, -fsperiod0.length);

      fsperiod1 = '!'.repeat(ocd(fsperiod0));
      fsending = '!'.repeat(ocd(fsopening));

      cofcurrent = '[[!!';
      cofclass = 0;
      setfsarrays();

      //if(overb[np])
      //   alert(st+'\n'+convert(st)+'\nprimer = '+fsopening+'\nperiod = '+fsperiod0);

      return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
   }





   // sum st1 + st2
   function getsum(st1, st2) {
      if (!st1)
         return st2;
      if (!st2)
         return st1;
      let s = '';
      let t = '';
      while (st2 && !isepsilon(st2)) {
         t = booster(st2);
         s = bb('', t) + s;
         st2 = base(st2);
      }
      //if(st2)
      if (st2 >= t)
         s = bb('', st2) + s;
      let x = antibooster(s);
      while (st1.length > 1 && booster(st1) < x)
         st1 = base(st1);
      return st1 + s;
   }





   // get b such as a + b = st, b is greatest ordinal less than d
   function getterms(st, d) {
      if (st < d)
         // return ['',st];      // get [a, b]
         return st;
      if (st == d)
         // return [st,''];      // get [a, b]
         return '';
      let s = '';
      let x = booster(st);
      let w;
      if (isepsilon(x))
         w = x;
      else {
         w = base(x);
         while (w && !isepsilon(w))
            w = base(w);
         w = bb(w, x);
      }
      //let w=isepsilon(x)?x:bb('',x);
      //let w=isepsilon(x)?x:bb(base(x),x);
      let t = '';
      while (st.length > 1 && (w + s < d)) {
         st = base(st);
         t = w + s;
         s = bb('', x) + s;
         //t=w;
         if (st.length > 1) {
            x = booster(st);
            if (isepsilon(x))
               w = x;
            else {
               w = base(x);
               while (w && !isepsilon(w))
                  w = base(w);
               w = bb(w, x);
            }
            //w=isepsilon(x)?x:bb('',x);
            //w=isepsilon(x)?x:bb(base(x),x);
         }
      }
      //return [st,t];      // get [a, b]
      return t;
   }





   // get largest booster substring s < d such as st = ...s]]]...]
   function getbs(st, d) {
      if (st < d)
         return st;
      if (st == d)
         return '';
      let x = booster(st);
      while (x >= d) {
         if (x == d)
            return '';
         st = x;
         x = booster(st);
      }
      return getterms(st, d);
   }





   // get next string with r
   function getnextb(st, r) {
      if (st < r)
         return r;
      let l = '';
      let x = booster(st);
      let e = 0;
      while (x > r) {
         l += base(st) + '[';
         e++;
         st = x;
         x = booster(st);
      }
      return l + getsum(st, r) + ('!'.repeat(e));
   }





   /*function stringtoterms(st){
   let s='';
   while(st&&!isepsilon(st))
      {
      s=bb('',booster(st))+s;
      st=base(st);
      }
   if(st)
      s=bb('',st)+s;
   return s;
   }*/





   /*function termstostring(st){
   let x=antibooster(st);
   return isepsilon(x)?x+antibase(st):st;
   }*/





   // extract string lesser than r from st
   /*function extractls(st,r){
   if(st<r)
      return st;
   let x=booster(st);
   while(x>=r)
      {
      if(x==r)
         return '';
      st=x;
      x=booster(st);
      }
   let s='';
   while(length(st)>1&&x<r)
      {
      s=bb('',x)+s;
      st=base(st);
      x=booster(st);
      }
   return termstostring(s);
   
   
   
   
   
   let s='';
   if(st<r)
      {
      s='';
      while(!isepsilon(st))
         {
         s=bb('',booster(st))+s;
         st=base(st);
         }
      s=bb('',st)+s;
      }
   else
      {
      let x=booster(st);
      while(length(st)>1&&x>=r)
         {
         st=x;
         x=booster(st);
         }
      s='';
      while(length(st)>1&&x<r)
         {
         s=bb('',x)+s;
         st=base(st);
         x=booster(st);
         }
      }
   return s;
   }*/





   // modify string st using modified previous regular m and original regular r
   function modstring_old(st, m, r) {
      if (!r)
         return st;
      let s = '';
      let xm = booster(m);
      let xmopening = '[';
      let xmending = '!';
      while (xm != r) {
         xmopening += base(xm) + '[';
         xmending += '!'
         xm = booster(xm);
      }
      xmopening = xmopening.slice(0, -1);
      xmending = xmending.slice(0, -1);
      let x = booster(st);
      while (st && x < xm) {
         s = bb('', xmopening ? xmopening + extractls(x, r) + xmending : x) + s;
         st = base(st);
         x = booster(st);
      }
      return base(m) + s;
   }





   // set st "modulo" r
   function stringmodulo(st, r) {
      if (st < r)
         return '';
      if (st == r)
         return st;
      let s = '';
      let e = 0;
      let x = booster(st);
      while (x > r) {
         s += base(st) + '[';
         e++;
         st = x;
         x = booster(st);
      }
      while (st.length > 1 && x < r) {
         st = base(st);
         x = booster(st);
      }
      return s + st + ('!'.repeat(e));
   }





   // modify string st using cb, lar
   function modstring(cb, lar) {

      function getmstring(st, e) {
         if (!e)
            return st;
         let s = '';
         let x = booster(st);
         let r = cb[lar[e - 1]];
         //let p=cb[lar[e]+1];
         //let p=getnextb(x,r);
         //let p=antibooster(cb[lar[e]]);
         //let p=getbs(antibooster(cb[lar[e]]),r);
         //let p=stringmodulo(antibooster(cb[lar[e]]),r);
         let p = cb[lar[e]];
         while (booster(p) < x)
            p = base(p);
         p = booster(p);
         let px = '';
         let cx;
         while (st.length > 1 && x < p)
         //while(st.length>1)
         {
            st = base(st);
            cx = leftw[e] + getsum(centralw[e], getmstring(getbs(x, r), e - 1)) + rightw[e];
            if (cx >= px) {
               s = bb('', cx) + s;
               px = cx;
            }
            x = booster(st);
         }
         return baseofr[e] + s;
      }

      let leftw = Array(lar.length);
      let rightw = Array(lar.length);
      let centralw = Array(lar.length);
      let baseofr = Array(lar.length);
      for (let e = 1; e < lar.length; e++) {
         baseofr[e] = base(cb[lar[e]]);
         let i = lar[e - 1] - lar[e] - 2;
         if (i < 0) {
            leftw[e] = '';
            rightw[e] = '';
            centralw[e] = '';
         }
         else {
            let s = cb[lar[e - 1] - 1];
            leftw[e] = cb[lar[e] + 1].slice(0, -s.length - i);
            rightw[e] = '!'.repeat(i);
            centralw[e] = base(s);
         }
      }
      return getmstring(cb[lar.at(-1)], lar.length - 2);
   }





   function trimboosters(st, r) {
      //if(!r)
      //   return st;
      while (st.length > 1 && booster(st) < r)
         st = base(st);
      return bb(st, r);
   }





   // st - modified string, r - model string (January 2025 version)
   function modstring_new_jan(st, r) {
      if (r == col) {
         if (st == col)
            return '[c!';
         if (st[0] == col) {
            let s = st.slice(1);
            return (antibooster(s) > col ? '' : '[c!') + s;
            //return s;
            //return getsum('[c!',getterms(st,col));
         }
         return st;
      }
      let x = booster(st);
      let xr = booster(r);
      if (st.length < 2 || x >= xr)
         //if(st.length<2||x>=r)
         //if(st.length<2||x>=antibooster(r))
         //if(st.length<2||(r<col)&&(x>=antibooster(r)))
         //if(st.length<2||(x>=xr&&(r<col)&&(x>=antibooster(r))))
         return trimboosters(base(r), modstring_new(st, xr));
      return trimboosters(modstring_new(base(st), r), modstring_new(x, xr));
   }





   function bbm(st, r) {
      while (st.length > 1 && booster(st) < r)
         st = base(st);
      if (!st) {
         if (isepsilon(r))
            return r;
         st = r;
         while (st && !isepsilon(st))
            st = base(st);
      }
      return bb(st, r);
   }





   function trimc(st) {
      while (st.length > 1 && booster(st) < col)
         st = base(st);
      return st;
   }





   // st - modified string, r - model string
   function modstring_new_june(st, r) {
      if (r == col && st < col)
         return st;
      if (st.length < 2)
         return base(r);
      if (isepsilon(st) && !isepsilon(r))
         return bbm(base(r), modstring_new_june(st, booster(r)));
      if (!isepsilon(st) && isepsilon(r))
         return bbm(modstring_new_june(base(st), r), modstring_new_june(booster(st), r));
      //if(r<col&&trimc(booster(st))>=trimc((antibooster(r))))
      //   return base(r);
      return trimboosters(modstring_new_june(base(st), r), modstring_new_june(booster(st), booster(r)));
   }





   // st - modified string, r - model string
   function modstring_new_july(st, r) {
      let x = booster(st);
      let y = booster(r);
      let ax;
      if (x < y)
         ax = y;
      else {
         ax = antibooster(r);
         while (ax.length > 1 && booster(ax) < col)
            ax = base(ax);
      }
      let m = '';
      let mx;
      let mx1 = '';
      while (st && booster(st) < ax) {
         mx = modstring_new_june(x, y)
         st = base(st);
         x = booster(st);
         if (mx >= mx1) {
            m = '[' + mx + '!' + m;
            mx1 = mx;
         }
      }
      return base(r) + m;
   }





   function isone_old(st1, beta1, beta2, x) {
      if (altcompare(st1, beta2))
         return false;
      if (booster(beta2) != x)
         return true;
      return !isone(beta2, base(beta2), beta1, x);
   }





   // alternative comparison (st1<=*st2: true; st1>*st2: false)
   function altcompare_old(st1, st2) {
      if (st1 == st2)
         return true;
      if (st1.length < 2 || st2.length < 2)
         return st1.length <= st2.length;
      let beta2 = base(st2);
      let x2 = booster(st2);
      //if(altcompare(st1,beta2)||altcompare(st1,x2))
      if (altcompare(st1, x2) || altcompare(st1, topstring(st2)))
         return true;
      let beta1 = base(st1);
      let x1 = booster(st1);
      //if(altcompare(st2,beta1)||altcompare(st2,x1))
      if (altcompare(st2, x1) || altcompare(st2, topstring(st1)))
         return false;

      //if((x1<x2&&altcompare(beta1,beta2)==false)||(x1>x2&&beta1!=beta2&&altcompare(beta1,beta2)==true))
      //   alert(st1+'\n'+st2);  

      if (beta1 == beta2)
         return x1 < x2;
      if (x1 == x2)
         return altcompare(beta1, beta2);

      if (x1 > x2 && x1 == booster(beta2))
         return isone(beta2, base(beta2), beta1, x1);

      if (x1 < x2 && x2 == booster(beta1))
         return !isone(beta1, base(beta1), beta2, x2);

      return x1 < x2;

      //return x1==x2?altcompare(beta1,beta2):x1<x2;
   }





   function checkalt(st1, st2) {
      if (isone(st1, st2))
         return altcompare(booster(st1), booster(st2));
      if (isone(base(st2), st1))
         return true;
      return x1 < x2;
   }





   function isone(st1, st2) {
      if (st1 == st2)
         return true;
      let [sb1, sx1, s1] = getsbsb(st1);
      let [sb2, sx2, s2] = getsbsb(st2);
      if (sx1 != sx2 || altcompare(s1, sb2) || altcompare(s2, sb1) || isone(sb2, s1) || isone(sb1, s2))
         return false;
      return true;
   }





   // get superbase and subbooster of st
   function getsbsb(st) {
      let beta = base(st);
      let x = booster(st);
      if (x.length < 2)
         return [beta, x, st];
      let [sb, y, s] = getsbsb(x);
      sb = bb(beta, sb);
      if (altcompare(s, sb) || isone(sb, s))
         return [beta, x, st];
      return [sb, y, s];
   }





   // alternative comparison (st1<=*st2: true; st1>*st2: false)
   function altcompare(st1, st2) {
      if (st1 == st2)
         return true;
      if (st1.length < 2 || st2.length < 2)
         return st1.length <= st2.length;
      let beta2 = base(st2);
      let x2 = booster(st2);
      if (altcompare(st1, beta2) || altcompare(st1, x2))
         return true;
      let beta1 = base(st1);
      let x1 = booster(st1);
      if (altcompare(st2, beta1) || altcompare(st2, x1))
         return false;

      //b=altcompare(beta1,beta2);
      if (x1 == x2)
         return altcompare(beta1, beta2);

      //return b?checkalt(st1,st2):!checkalt(st2,st1);

      if (isone(st1, st2))
         return altcompare(booster(st1), booster(st2));

      let [sb1, sx1, s1] = getsbsb(st1);
      let [sb2, sx2, s2] = getsbsb(st2);

      if (altcompare(s1, sb2))
         return true;

      if (altcompare(s2, sb1))
         return false;

      if (isone(s1, sb2))
         return true;

      if (isone(s2, sb1))
         return false;

      return sx1 < sx2;
   }





   // continue opened string
   // b = true: larger; b = false: lesser
   function contostring(st, b) {
      if (st.at(-1) == col)
         return (b ? st : st.slice(0, -1)) + '[';
      return b ? st + col : st.slice(0, -1) + '![';
   }





   // open string
   function openstring(st) {
      let i = st.length - 1;
      while (st[i] == '!')
         i--;
      return st.slice(0, i + 1);
   }





   // close opened string
   function closestring(st) {
      return st + '!'.repeat(ocd(st));
   }





   // remove booster tower summit
   function topstring(st) {
      st = openstring(st);
      st = st.slice(0, st.at(-1) == col ? -2 : -1);
      return closestring(st);
   }





   // st - modified string, r - model string
   function modstring_new(st, r) {
      let st0 = openstring(st);
      //let rs=st0.length-openstring(r).length;
      let pr = st0.length;
      let l = st0.length * 2;
      let b = false;
      while (!b || st0.length < l) {
         st0 = contostring(st0, b);
         b = altcompare(closestring(st0), st);
      }

      let pl = 1;

      while (st0.slice(pr, pr + pl).repeat(Math.ceil((st0.length - pr) / pl)).slice(0, st0.length - pr) != st0.slice(pr))
         pl++;

      while ((st0.length - pr) / pl < 2) {
         while (!b || st0.length < 2 * pl + pr) {
            st0 = contostring(st0, altcompare(closestring(st0), st));
            b = altcompare(closestring(st0), st);
         }
         while (st0.slice(pr, pr + pl).repeat(Math.ceil((st0.length - pr) / pl)).slice(0, st0.length - pr) != st0.slice(pr))
            pl++;
      }
      return st0.slice(pr, pr + pl);
   }





   function spliceperiod(st) {
      let e = 2;
      while (e <= st.length) {
         if (!(st.length % e)) {
            let s = st.slice(0, st.length / e);
            if (s.repeat(e) == st)
               return spliceperiod(s);
         }
         e++;
      }
      return st;
   }





   // second comparison of strings st1, st1
   function sc(st1, st2) {
      if (st1 == st2)
         return 0;
      if (!st1)
         return -1;
      if (!st2)
         return 1;
      if (st1 == bo)
         return 1;
      if (st2 == bo)
         return -1;
      if (st1 == col)
         return st2.includes(col) ? -1 : 1;
      if (st2 == col)
         return st1.includes(col) ? 1 : -1;
      let beta1 = base(st1);
      let booster1 = booster(st1);
      let beta2 = base(st2);
      let booster2 = booster(st2);
      let s1 = sc(beta1, booster1) == 1 ? beta1 : booster1;
      let s2 = sc(beta2, booster2) == 1 ? beta2 : booster2;
      if (sc(s1, s2) == 1) {
         if (sc(s1, st2) >= 0)
            return 1;
      }
      else if (sc(s2, st1) >= 0)
         return -1;
      return st1 > st2 ? 1 : -1;
   }





   function istrim(st) {
      if (st.length < 2 || st == bo)
         return true;
      let beta = base(st);
      let x = booster(st);
      return istrim(x) && (beta.length < 2 || booster(beta) >= x);
   }





   function nextsymbol(s, st, openst, b) {
      let ns, cns;
      if (!s || s.at(-1) == '[') {
         ns = s + col;
         cns = closestring(ns);
         if (ns < openst && istrim(cns) && (b || sc(cns, st) < 0))
            return ns;
      }
      ns = s + '[';
      cns = closestring(ns);
      if (ns < openst && istrim(cns) && (b || sc(cns, st) < 0))
         return ns;
      return s + '!';
   }





   function getlesserstring(st, openst, n, b) {
      let s = '';
      while (s.length < n)
         s = nextsymbol(s, st, openst, b);
      return s;
   }





   function checkfselement(st, r) {
      if (st == bo)
         st = 'd';
      r = openstring(r);
      let s = getlesserstring(st, openstring(st), r.length, cofcurrent == bo || cofcurrent > '[[!!');
      if (r != s)
         alert(st + '\n' + convert(st) + '\n\n' + r + '\n' + s);
   }





   function getfselement(st, pr, p0, p1, e, nn, s = '', se = '') {
      //return pr+(p0.repeat(nn))+(p1.repeat(nn))+e);

      let r = s + (pr ? nn ? (pr + (p0.repeat(nn - 1)) + (p1.repeat(nn - 1)) + e) : '' : (p0.repeat(nn)) + (p1.repeat(nn)) + e) + se;
      //checkfselement(st,r);
      return r;

      //return s+(pr?nn?(pr+(p0.repeat(nn-1))+(p1.repeat(nn-1))+e):'':(p0.repeat(nn))+(p1.repeat(nn))+e)+se;

      //pr=s+pr;
      //e=e+se;
      //return pr?nn?(pr+(p0.repeat(nn-1))+(p1.repeat(nn-1))+e):'':(p0.repeat(nn))+(p1.repeat(nn))+e
   }





   // st - modified string, r - model string
   /*function isnewmodstring_old(st,r){
   let r0=openstring(r);
   if(booster(r)==col&&st.slice(0,r0.length-1)==r0.slice(0,-1))
      return true;
   return false;
   }*/





   // st - modified string, r - model string
   /*function isnewmodstring(cb,lar){
   modc++;
   let st=cb[lar[2]];
   let r=cb[lar[1]];
   if(lar[0]-lar[2]==2&&base(st)>=base(r))
      return true;
   modoldc++;
   return false;
   }*/





   // st - modified string, r - model string
   /*function modstring_new_october(st,r){
   return st;
   }*/





   function modstring_new2(cb, lar, gs = false) {
      modc++;
      //let d=lar[2];
      let u = lar[1];
      let c = lar[0];
      let st = cb[lar[2]];
      let r = cb[u];
      if (c - u == 1 && base(st) >= base(r))
         return st + (gs ? '1' : '');

      let g = antibooster(r);
      let d = cb[u + 1];
      let csquared = 'c[c[c!!';
      if (g < csquared && d < csquared) {
         while (g.length > 1 && booster(g) < col)
            g = base(g);
         d = base(d);
         let s = base(r);
         while (antibooster(st) >= g)
            st = antibase(st);
         while (st) {
            s = trimboosters(s, getsum(d, getterms(antibooster(st), col)));
            st = antibase(st);
         }
         return s + (gs ? '2' : '');
      }

      modoldc++;
      return false;
   }





   function a_new3(st) {
      if (st == col)
         return col;
      return trimboosters(a_new3(base(st)), m_new3(booster(st)));
   }





   function m_new3(st) {
      if (st < col)
         return st;
      if (st == col)
         return '';
      let beta = base(st);
      return getterms(a_new3(st), col);
   }





   /*function fill_new3(st,a){
   if(!st)
      return '';
   return bb(fill_new3(base(st),a),getsum(a,booster(st)));
   }*/





   function fill_new3(r, st) {
      if (!st)
         return base(r);
      if (r == col)
         return st;
      if (isepsilon(st))
         return bb(base(r), fill_new3(booster(r), st));
      return trimboosters(fill_new3(r, base(st)), fill_new3(booster(r), booster(st)));
   }





   function modstring_new3(cb, lar, gs = false) {
      let u = lar[1];
      let c = lar[0];
      let st = cb[lar[2]];
      let r = cb[u];
      //let g=antibooster(r);
      /*let g=base(r);
      g=g?booster(g):booster(r);
      while(g.length>1&&booster(g)<col)
         g=base(g);
      while(antibooster(st)>=g)
         st=antibase(st);*/
      let g = r;
      while (antibooster(st) == antibooster(g)) {
         st = antibase(st);
         g = antibase(g);
      }
      st = m_new3(col + st);
      /*st=getsum(col,m_new3(col+st)).slice(1); 
      let i=-2;
      if(c-u>1)
         {
         i=-cb[c-1].length
         st=fill_new3(st,base(cb[c-1]));
         }
      return closestring(openstring(r).slice(0,i)+st);*/
      return fill_new3(r, st);
   }





   function modstring_new4(st, r, b = false) {
      if (r == col) {
         if (st < col)
            return st;
         if (st == col)
            return '';
         let m = '';
         let s = '';
         let x = '';
         while (st > col) {
            x = modstring_new4(booster(st), r, true);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return getterms(col + s, col);
      }
      let y = booster(r);
      let m = '';
      let s = '';
      let x = '';
      while (r.slice(0, st.length) != st) {
         x = modstring_new4(b && isepsilon(st) ? st : booster(st), y, true);
         st = base(st);
         if (x >= m) {
            m = x;
            s = antibb(x, s);
         }
      }
      return base(r) + s;
   }





   function modstring_new5(st, r) {
      if (r == col) {
         if (st < col)
            return st;
         if (st == col)
            return '';
         let m = '';
         let s = '';
         let x = '';
         while (st > col) {
            x = modstring_new5(booster(st), r);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return getterms(col + s, col);
      }
      let y = booster(r);
      let m = '';
      let s = '';
      let x = '';
      while (r.slice(0, st.length) != st) {
         //x=modstring_new5(!isepsilon(r)&&isepsilon(st)?st:booster(st),y);
         x = modstring_new5((!isepsilon(r) || st >= r) && isepsilon(st) ? st : booster(st), y);     // 30 January 2026
         st = base(st);
         if (x >= m) {
            m = x;
            s = antibb(x, s);
         }
      }
      return base(r) + s;
   }





   function modstring_new6(st, r) {
      if (r == col) {
         if (st < col)
            return st;
         if (st == col)
            return '';
         let m = '';
         let s = '';
         let x = '';
         while (st > col) {
            x = modstring_new6(booster(st), r);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return getterms(col + s, col);
      }
      let y = booster(r);
      let m = '';
      let s = '';
      let x = '';
      while (r.slice(0, st.length) != st) {
         x = modstring_new6(!isregt(r) && isregt(st) ? st : booster(st), y);
         st = base(st);
         if (x >= m) {
            m = x;
            s = antibb(x, s);
         }
      }
      return base(r) + s;
   }





   function modstring_new7(cb, lar) {
      let e = 0;
      let st = col;
      while (e < nlevels) {
         e++;
         st = modstring_new5(cb[lar[e]], st);
      }
      return st;
   }





   function modstring_new8(cb, lar) {
      let e = 0;
      let st = col;
      let i;
      while (e < nlevels) {
         e++;
         i = lar[e - 1] - lar[e];
         st = modstring_new5(cb[lar[e]].slice(0, -i - cb[lar[e - 1]].length) + st + ('!'.repeat(i)), st);
      }
      return st;
   }





   function modstring_new9(st) {
      let pp = [];
      let star = [st];
      let rar = [];
      let e;
      let i = -1;
      while (i < 0) {
         e = pp.length - 1;
         i = e - 1;
         while (i >= 0 && (star[i] != star[e] || rar[i] != rar[e]))
            i--;
         if (i < 0) {
            e++;
            let t = getbtower(star[e]);
            let u = getllr(t);
            let c = countreglevels(t);
            if (c != nlevels)
               //if(c>nlevels+1)
               alert(st + '\n' + convert(st) + '\n\noriginal string: ' + star[e - 1] + '\nmodifyed string: ' + star[e] + '\n\ncounter of regular levels: ' + c);
            rar.push(t[u]);
            star.push(modstring_new5(star[e], rar[e]));
            pp.push(star[e].slice(0, -u - t[u].length));
         }
      }
      e--;
      let period = '';
      while (e >= i) {
         period = pp[e] + period;
         e--;
      }
      let primer = '';
      while (e >= 0) {
         primer = pp[e] + primer;
         e--;
      }
      return [primer, spliceperiod(period)];
   }





   function modstring_new10(st) {
      let star = [];
      let rar = [];
      let pp = [0];
      let e;
      let i = -1;
      let s = st;
      while (i < 0) {
         e = pp.length - 2;
         i = e - 1;
         while (i >= 0 && (star[i] != star[e] || rar[i] != rar[e]))
            i--;
         if (i < 0) {
            e++;
            let t = getbtower(s);
            let [f, r] = getfr(t);
            if (f < 0)
               alert(st + '\n' + convert(st) + '\n\noriginal string: ' + s + '\n\nf: ' + f + '\nr: ' + r);
            star.push(t[f]);
            rar.push(t[r]);
            pp.push(s.length - r - t[r].length);
            s = s.slice(0, -r - t[r].length) + modstring_new5(t[f], t[r]) + ('!'.repeat(r));
            let mst = modstring_new5(t[f], t[r]);
            /*if(mst>=t[r])
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmodifyed string: '+mst);*/
            let c = countreglevels(getbtower(mst));
            if (c != nlevels)
               alert(st + '\n' + convert(st) + '\n\noriginal string: ' + t[f] + '\nmodel string: ' + t[r] + '\nmodifyed string: ' + mst + '\n\ncounter of regular levels: ' + c);
         }
      }
      return [s.slice(0, pp[i]), spliceperiod(s.slice(pp[i], pp[e]))];
   }





   function modstring_new11(st) {
      let star = [st];
      let pp = [0];
      let e;
      let i = -1;
      let s = '';
      let r;
      while (i < 0) {
         e = pp.length - 2;
         i = e - 1;
         while (i >= 0 && star[i] != star[e])
            i--;
         if (i < 0) {
            e++;
            s += base(star[e]) + '[';
            r = booster(star[e]);
            if (isepsilon(star[e]))
               while (!isepsilon(r)) {
                  s += base(r) + '[';
                  r = booster(r);
               }
            pp.push(s.length);
            star.push(modstring_new5(star[e], r));
         }
      }
      return [s.slice(0, pp[i]), spliceperiod(s.slice(pp[i], pp[e]))];
   }





   function getrest(st, r) {
      if (st < r)
         return st;
      let s = '';
      let m = '';
      let x = '';
      //while(!isepsilon(st))
      while (st.length > 1) {
         x = getrest(booster(st), r);
         st = base(st);
         if (x >= m) {
            m = x;
            s = antibb(x, s);
         }
      }
      /*if(!s)
         return s;*/
      if (isepsilon(m))
         return m + antibase(s);
      x = base(m);
      while (x && !isepsilon(x))
         x = base(x);
      return x + s;

      /*if(getterms(col+s,col)!=m+s)
         alert(st+'\n'+convert(st)+'\n\n'+s+'\n'+x+'\n'+getterms(col+s,col)+'\n'+m+s);
      if(booster(m)>=x)
         s=m+s;
      return getterms(col+s,col);
      return s;*/
   }





   function modstring_new12(st, r, ra, ri) {
      if (r == ra[ri]) {
         st = getrest(st, r);
         return ri ? modstring_new12(st, r, ra, ri - 1) : st;
      }
      let y = booster(r);
      let s = '';
      let m = '';
      let x = '';
      while (st.length >= r.length || r.slice(0, st.length) != st) {
         x = modstring_new12(r != ra[ri + 1] && isepsilon(st) ? st : booster(st), y, ra, ri);
         //x=modstring_new12(!isepsilon(r)&&isepsilon(st)?st:booster(st),y,ra,ri);
         st = base(st);
         if (x >= m) {
            m = x;
            s = antibb(x, s);
         }
      }
      /*r=base(r);
      if(!r&&!isepsilon(s))
         if(isepsilon(x))
            s=x+antibase(s);
         else
            {
            m=antibooster(x);
            if(booster(m)>=x)
               s=m+s;
            }
      else
         s=r+s;
      return s;*/
      return base(r) + s
   }





   function modstring_new13(st, r, ra, ri) {
      if (r == ra[ri]) {
         st = getrest(st, r);
         return ri ? modstring_new13(st, r, ra, ri - 1) : st;
      }
      let y = booster(r);
      let s = '';
      let m = '';
      let x = '';
      while (st.length >= r.length || r.slice(0, st.length) != st) {
         x = modstring_new13(r == ra[ri + 1] || !isepsilon(st) || (isepsilon(r) && !isreg(st)) ? booster(st) : st, y, ra, ri);
         st = base(st);
         if (x >= m) {
            m = x;
            s = antibb(x, s);
         }
      }
      return base(r) + s;
   }





   function getcnf(st) {
      let c = [];
      while (st && !isepsilon(st)) {
         c.push(booster(st));
         st = base(st);
      }
      //if(st&&st>=(c.at(-1)??''))
      if (st)
         c.push(st);
      return c;
   }





   function clearcnf(s) {
      let cl = [];
      let m = '';
      for (let e = 0; e < s.length; e++)
         if (s[e] >= m) {
            m = s[e];
            cl.push(m);
         }
      return cl;
   }





   function getepsilonpart(st) {
      while (st && !isepsilon(st))
         st = base(st);
      return st;
   }





   function getstring(cs) {
      let st = '';
      if (cs.length) {
         let s = cs.at(-1);
         let e = getepsilonpart(s);
         st = e == s ? e : bb(e, s);
      }
      for (let e = cs.length - 2; e >= 0; e--)
         st = bb(st, cs[e]);
      return st;
   }





   function modstring_new14(st, r) {
      if (r == col && st < r)
         return st;
      let [b1, b2] = [isepsilon(st), isepsilon(r)];
      if (b1 && b2) {
         if (st == col)
            return '';
         let [r1, r2] = [isreg(st), isreg(r)];
         st = (!r1 || r2 ? col : '') + st;
         //st=col+st;
         //b2=!r2||r1;
         r = (b2 ? col : '') + r;
      }
      //if(b1&&b2)
      //   return st==col?'':modstring_new14(col+st,col+r).slice(1);
      st = getcnf(st);
      r = getcnf(r);
      let e = r.length - 1;
      while (e && r[e] == st.at(-1)) {
         e--;
         st.pop();
      }
      for (e = 0; e < st.length; e++)
         st[e] = modstring_new14(st[e], r[0]);
      return getstring(clearcnf(st).concat(r.slice(1))).slice(b1 && b2 ? 1 : 0);
   }





   function modstring_new15(st, r, ra, ri) {
      modc++;

      // r is next Omega
      let nextomega = col;
      for (let e = 1; e < nlevels; e++)
         nextomega = trimboosters(st, nextomega);
      if (r == nextomega)
         return st;

      // all boosters of st should not be modified as booster of r, and base of st is not modified
      let d = base(r);
      if (st.length > d.length && st.slice(0, d.length) == d) {
         let s = st.slice(d.length);
         let b = true;
         let y = openstring(booster(r)).slice(0, -1) + '[' + col;
         while (b && s) {
            let x = booster(s);
            s = base(s);
            if (x.length < y.length || x.slice(0, y.length) != y)
               b = false;
         }
         if (b)
            return st;
      }

      // all boosters of st should not be modified as booster of r, and base of st is modified
      while (d && (st.length <= d.length || st.slice(0, d.length) != d))
         d = base(d);
      let s = st.slice(d.length);
      let b = true;
      let y = openstring(booster(r)).slice(0, -1) + '[' + col;
      while (b && s) {
         let x = booster(s);
         s = base(s);
         if (x.length < y.length || x.slice(0, y.length) != y)
            b = false;
      }
      if (b)
         return base(r) + st.slice(d.length);

      modoldc++;
      return modstring_new13(st, r, ra, ri);
   }





   // get left common part of s and r
   function getlcp(s, r) {
      while (s.length > r.length || r.slice(0, s.length) != s)
         s = base(s);
      return s;
   }





   // triple modification
   function trimod(s, st, r) {
      if (st <= s)
         return st;
      if (st >= col) {
         r = col;
         st = st.slice(1);
      }
      else
         st = st.slice(getlcp(s, st).length);
      let t = r;
      while (st) {
         //t=trimboosters(t,trimod(s,antibooster(st),r));
         t = trimboosters(t, trimod(getlcp(antibooster(st), r), antibooster(st), r));
         st = antibase(st);
      }
      return t;
   }





   function modstring_new16(st, r) {
      return trimod(getlcp(st, r), st, base(r));
   }





   function conpp(st) {
      let star = [];
      let rar = [];
      let pp = [0];
      let e;
      let i = -1;
      let s = st;
      while (i < 0) {
         e = pp.length - 2;
         i = e - 1;
         while (i >= 0 && (star[i] != star[e] || rar[i] != rar[e]))
            i--;
         if (i < 0) {
            e++;
            let [t, ra] = getbratower(s);
            let [f, r] = getfr(t);
            /*if(f<0)
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+s+'\n\nf: '+f+'\nr: '+r);*/
            star.push(t[f]);
            rar.push(t[r]);
            pp.push(s.length - r - t[r].length);
            s = s.slice(0, -r - t[r].length) + modstring_new15(t[f], t[r], ra, nlevels - 2) + ('!'.repeat(r));
            //let mst=modstring_new15(t[f],t[r],ra,nlevels-2);
            //s=s.slice(0,-r-t[r].length)+modstring_new16(t[f],t[r])+('!'.repeat(r));
            //let mst=modstring_new16(t[f],t[r]);
            modoldfraction = modoldc / modc;
            //let mst13=modstring_new13(t[f],t[r],ra,nlevels-2);
            //let mst12=modstring_new12(t[f],t[r],ra,nlevels-2);
            //let mst5=modstring_new5(t[f],t[r]);
            /*if(mst!=mst5)
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmst5: '+mst5+'\nmst: '+mst);*/
            /*if(mst!=mst12)
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmst12: '+mst12+'\nmst: '+mst);*/
            /*if(mst!=mst13)
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmst13: '+mst13+'\nmst16: '+mst);*/
            /*if(mst>=t[r])
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmodifyed string: '+mst);*/
            /*let c=countreglevels(getbtower(mst));
            if(c!=nlevels)
               alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmodifyed string: '+mst+'\n\ncounter of regular levels: '+c);*/
         }
      }
      return [s.slice(0, pp[i]), spliceperiod(s.slice(pp[i], pp[e]))];
   }





   function modysttoperiod_old(modyst, l) {
      let e = modyst.length - 1;
      while (modyst[e] == '!')
         e--;
      modyst = modyst.slice(0, e);
      modyst = modyst.slice(0, 1 - l);
      l = l % modyst.length;
      return spliceperiod(modyst.slice(l) + modyst.slice(0, l));
   }





   function modysttoperiod(modyst, l, l1) {
      let e = modyst.length - 1;
      while (modyst[e] == '!')
         e--;
      modyst = modyst.slice(0, e);
      modyst = modyst.slice(0, 1 - l);
      l1 = l1 % modyst.length;
      return spliceperiod(modyst.slice(l1) + modyst.slice(0, l1));
   }





   // get booster tower of st
   function getbtower(st) {
      let t = [];
      while (st) {
         t.push(st);
         st = booster(st);
      }
      return t;
   }





   // get booster tower and regulars of st
   function getbratower(st) {
      let t = [];
      while (st) {
         t.push(st);
         st = booster(st);
      }
      let i = t.length - 1;
      let ra = [col];
      while (i) {
         i--;
         if (t[i] < ra.at(-1))
            ra.push(t[i]);
      }
      return [t, ra];
   }





   // get level of lowest regular of booster tower t
   function getllr(t) {
      let i = t.length - 1;


      for (let e = i; e > 0; e--)
         if (t[e] < t[i])
            i = e;

      /*let u=nlevels;
      let e=i;
      while(u>1)
         {
         e--;
         if(t[e]<t[i])
            {
            i=e;
            u--;
            }
         }*/

      return i;
   }





   // get floor and lowest reqular of booster tower t
   function getfr(t) {
      let i = t.length - 1;
      let u = nlevels;
      let e = i;
      while (u > 1) {
         e--;
         if (t[e] < t[i]) {
            i = e;
            u--;
         }
      }
      while (t[e] >= t[i])
         e--;
      return [e, i];
   }





   function countreglevels(t) {
      let c = 0;
      let i = t.length - 1;
      for (let e = i - 1; e >= 0; e--)
         if (t[e] < t[i]) {
            i = e;
            c++;
         }
      if (i > 0)
         c += 0.5;
      return c;
   }





   function isnlevels(st) {
      let t = getbtower(st);
      let e = t.length;
      let i = 0;
      let s = t[e - 1];
      while (e) {
         e--;
         if (t[e] < s) {
            i++;
            s = t[e];
         }
      }
      return i == nlevels && s == st;
   }





   /*function isregt(st){
   let t=getbtower(st);
   let e=t.length;
   let i=0;
   let s=t[e-1];
   while(e)
      {
      e--;
      if(t[e]<s){
         i++;
         s=t[e];
         }
      }
   return s==st;
   }*/





   // is st regular
   function isreg(st) {
      if (!st) return false;
      if (st == col) return true;
      if (openstring(st).at(-1) == '[') return false;
      for (let s = booster(st); s; s = booster(s))
         if (s < st) return false;
      return true;
   }





   function getrlength(st) {
      let t = getbtower(st);
      let e = t.length;
      let i = 1;
      let s = t[e - 1];
      while (i < nlevels) {
         e--;
         if (t[e] < s) {
            i++;
            s = t[e];
         }
      }
      return s.length - t.length + e + 1;
   }





   function checkrp(st, l, p) {
      st = st.slice(0, -l - 1) + '[' + col;
      while (p.length < st.length)
         p = p + p;
      return st == p.slice(0, st.length);
   }





   // get n-th element of fs of ordinal st
   function fs(st, n, nn = 0) {

      //let nin=getnin(st);
      //if(nin>4)
      //   alert(st+'\n'+convert(st)+'\nnin = '+nin);

      // optimization
      if (st == fscurrent)
         //return fsopening+(fsperiod0.repeat(nn))+(fsperiod1.repeat(nn)+fsending);
         //return fsopeningarray[subperiodpositionshift]+(fsperiodarray[subperiodpositionshift].repeat(nn))+(fsperiod1.repeat(nn)+fsendingarray[subperiodpositionshift]);
         return getfselement(st, fsopeningarray[subperiodpositionshift], fsperiodarray[subperiodpositionshift], fsperiod1, fsendingarray[subperiodpositionshift], nn, fsprimer0, fsending0);

      if (fscurrent)
         subperiodpositionshift = 0;

      fscurrent = st;
      cblen = 0;
      cbc = 0;
      cpn = 0;

      // limit rule
      if (st == bo) {
         cofcurrent = st;
         cofclass = 3;

         if (uncountablemode) {
            //uncountable
            fsopening = col;
            fsperiod0 = '[' + col;
            fsperiod1 = '!';
            fsending = '';
            setfsarrays();
            fsprimer0 = '';
            fsending0 = '';
            //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
            return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn);
         }
         else {
            //countable
            fsopening = nlevels ? '['.repeat(nlevels - 1) : col;
            fsperiod0 = '[' + col;
            fsperiod1 = '!';
            fsending = nlevels ? '!'.repeat(nlevels - 1) : '';
            setfsarrays();
            fsprimer0 = '';
            fsending0 = '';
            //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
            return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn);
         }
      }

      let i = st.length - 1;
      while (st[i] == '!')
         i--;
      let e = st[i] == '[';
      let st0 = st.slice(0, i);
      let st1 = st.slice(i + (e ? 2 : 1));
      let s1;

      // successor and plain rule
      if (e) {
         st0 += '!';
         cofcurrent = st1 ? '[[!!' : '[!';
         cofclass = st1 ? st == cofcurrent ? 3 : 0 : 2;
         let st2 = st1;
         //s1=bb('',booster(st0));
         s1 = st1 ? bb('', booster(st0)) : '';
         st1 = st1.slice(1);
         fsopening = base(st0);
         fsperiod0 = s1;
         fsperiod1 = '';
         fsending = st1;

         setfsarrays();
         fsprimer0 = '';
         fsending0 = '';
         //return fsopening+fsperiod0.repeat(nn)+fsending;
         return getfselement(st, fsopening, fsperiod0, '', fsending, nn);
      }

      // main rule
      let stt = st0;
      let u = i - 1;

      while (st0[u] == '[')
         u--;
      u = i - u - 1;

      st0 += '[';

      st1 = st1.slice(u);
      let s;

      u++;
      let uo = '['.repeat(u);

      let cb = [st];
      //let nc=[1,1];
      while (cb.at(-1).length > 1) {
         cb.push(booster(cb.at(-1)));
      }

      let nod = 0;
      let mb = col;
      for (i = cb.length - 1; i >= 0; i--)
         if (cb[i] < mb) {
            nod++;
            mb = cb[i];
         }

      let noi = 0;
      mb = st;
      for (i = 0; i < cb.length; i++)
         if (cb[i] > mb) {
            noi++;
            mb = cb[i];
         }

      //if(nod>4||noi>4)
      //   alert(st+'\n'+convert(st)+'\nnod = '+nod+'\nnoi = '+noi);

      let pn = cb.length - 1;
      //let lrn=pn;
      let nl = nlevels;

      // pn1 - index of second lowest regular of booster tower
      let pn1;

      let lr = 'c';
      let lar = [pn];
      //let r;           // more powerful system

      while (nl) {
         if (cb[pn] < lr) {
            //lrn=pn;
            lr = cb[pn];
            lar.push(pn);
            nl--;

            if (nl == 1)
               pn1 = pn;

            // more powerful system
            /*let q=base(lr);
            if(lar.length>2&&q!=r)
               {
               nl=0;
               r=q;
               
               let w=booster(lr);                      // new
               while(booster(q)==w)
                  q=base(q);
                  
               while(q.length>1&&booster(q)==col)
                  {
                  q=base(q);
                  nl++;
                  }
               }*/

         }
         else {
            pn--;

            // cof > ω
            if (pn < 0) {
               fsopening = st0.slice(0, -1);
               fsperiod0 = '[' + col;
               while (fsopening.slice(-2) == fsperiod0)
                  fsopening = fsopening.slice(0, -2);
               fsperiod1 = '!';
               fsending = '!'.repeat(ocd(fsopening));
               cofcurrent = lr;
               cofclass = st == cofcurrent ? 3 : 0;
               setfsarrays();
               fsprimer0 = '';
               fsending0 = '';
               //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
               return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn);
            }

         }
      }

      //if(st>'[c!')
      //   alert(st);





      //st0=st.slice(0,-cb.length)+'[';
      st0 = cb[pn].slice(0, -cb.length + pn) + '[';

      /*let modyst=cb[lar[1]];
      e=2;
      while(e<lar.length)
         {
         modyst=modstring(cb[lar[e]],modyst,cb[lar[e-2]]);
         e++;
         }
      e=modyst.length-1;
      while(modyst[e]=='!')
         e--;
      modyst=modyst.slice(0,e);
      e=cb[lar.at(-2)].length-cb.length+pn1;
      modyst=modyst.slice(1,-e)+'[';
      e=e%modyst.length;
      modyst=spliceperiod(modyst.slice(e)+modyst.slice(0,e));*/
      //modyst=spliceperiod(modyst.slice(cb[lar.at(-2)].length-cb.length+pn1+2,e)+'[');

      i = pn1;
      //let modyst=modstring_new(cb[pn],cb[pn1]);
      //let modyst=isnewmodstring(cb[pn],cb[pn1])?modstring_new_october(cb[pn],cb[pn1]):modyst_old;
      //let modyst=isnewmodstring(cb,lar)?modstring_new2(cb,lar):modyst_old;

      //let modyst_old=modstring(cb,lar);            // January 2025
      //let modyst=modstring_new2(cb,lar,true);      // 02 January 2026
      //let modyst_3=modstring_new3(cb,lar);         // 12 January 2026
      //let modyst_4=modstring_new4(cb[pn],cb[pn1]); // 13 January 2026
      //let modyst_5=modstring_new5(cb[pn],cb[pn1]);   // 16 January 2026
      //let modyst_6=modstring_new6(cb[pn],cb[pn1]); // 21 January 2026
      //let modyst_7=modstring_new7(cb,lar);           // 21 January 2026
      //let modyst_8=modstring_new8(cb,lar);           // 23 January 2026
      //let [primer_9,period_9]=modstring_new9(cb[pn]);           // 26 January 2026
      //let [primer_10,period_10]=modstring_new10(cb[pn]);           // 27 January 2026
      //let [primer_11,period_11]=modstring_new11(cb[pn]);           // 27 January 2026
      //let modyst_12=modstring_new12(cb[pn],cb[pn1],[col,cb[pn1]],0);   // 10 February 2026
      let [primer_10, period_10] = conpp(cb[pn]);           // 11 February 2026

      /*let mstep;
      if(!modyst)
         {
         modyst=modyst_old;
         mstep='0';
         }
      else
         {
         mstep=modyst.at(-1);
         modyst=modyst.slice(0, -1)
         }
      
      modoldfraction=modoldc/modc;*/

      //if(modyst!=modyst_old)
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_old: '+modyst_old+'\n'+convert(modyst_old)+'\n\nmodyst_new: '+modyst+'\n'+convert(modyst));

      //if(modyst!=modyst_3&&modyst_old!=modyst_3)
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_old: '+modyst_old+'\n'+convert(modyst_old)+'\n\nmodyst: '+modyst+'\n'+convert(modyst)+'\n\nmodyst_3: '+modyst_3+'\n'+convert(modyst_3));

      //if(modyst!=modyst_3)
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst: '+modyst+'\n'+convert(modyst)+'\n\nmodyst_3: '+modyst_3+'\n'+convert(modyst_3));

      //if(modyst_3!=modyst_4&&cb[pn]!=modyst_4)
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_3: '+modyst_3+'\n'+convert(modyst_3)+'\n\nmodyst_4: '+modyst_4+'\n'+convert(modyst_4));

      //if(modyst_4!=modyst_5&&cb[pn]!=modyst_5)
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_4: '+modyst_4+'\n'+convert(modyst_4)+'\n\nmodyst_5: '+modyst_5+'\n'+convert(modyst_5));

      //if(modyst_5!=modyst_12)
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_5: '+modyst_5+'\n'+convert(modyst_5)+'\n\nmodyst_12: '+modyst_12+'\n'+convert(modyst_12));

      /*if(modyst_7!=modyst_8)
         alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_7: '+modyst_7+'\n'+convert(modyst_7)+'\n\nmodyst_8: '+modyst_8+'\n'+convert(modyst_8));*/



      //if(modyst_5=='[[c[[[c!!!!!')
      /*if(modyst_5=='[[[c![[[c!!!!!')
         alert('!');*/

      /*let ror=0;
      while(ror<nlevels&&lar[ror]-lar[ror+1]==1)
         ror++;*/

      //let modyst=modysttoperiod_old(modyst_5,cb[i].length-lar[0]+i);

      /*let modyst_p=modysttoperiod(modyst_7,getrlength(modyst_7),0);
      let crpcounter=0;
      for(i=1;i<nlevels;i++)
         if(checkrp(cb[lar[i]],lar[0]-lar[i],modyst_p))
            crpcounter++;
      if(modyst_p!='['&&crpcounter<1)
         alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nperiod: '+modyst_p+'\n\ncrpcounter: '+crpcounter);
      i=nlevels-1;
      while(modyst_p!='['&&!checkrp(cb[lar[i]],lar[0]-lar[i],modyst_p))
         i--;
      
      //let modyst=modysttoperiod(modyst_7,getrlength(modyst_7),cb[lar[i]].length-lar[0]+lar[i]);
      
      i=nlevels-1;
      while(modyst_7>cb[lar[i]])
         i--;
      st0=cb[pn].slice(0,pn-lar[i]-cb[lar[i]].length);
      let modyst=modysttoperiod(modyst_7,getrlength(modyst_7),0);*/

      /*if(st0<(primer_9+(period_9.repeat(10))).slice(0,st0.length))
         alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nst0: '+st0+'\n\npp: '+((primer_9+(period_9.repeat(10))).slice(0,st0.length)));
         
      if(st0<primer_9)
         alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nst0: '+st0+'\n\nprimer_9: '+primer_9+'\nperiod_9: '+period_9);*/

      st0 = primer_10;
      let modyst = period_10;

      /*if((modyst!='['&&modyst[0]!=col&&ror==1)||(modyst[0]==col&&ror>1))
         alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nror: '+ror);*/

      //if(cb[i].length-lar[0]+i!=getrlength(modyst_7))
      //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\n'+(cb[i].length+i-lar[0])+'\n\n'+getrlength(modyst_7));

      /*if(!isnlevels(modyst_8))
         alert(st+'\n'+convert(st)+'\n\nmodyst_8: '+modyst_8);*/

      /*if(nlevels>2&&!pn&&!base(st))
         {
         let modyst_m1=modstring_new5(cb[lar[nlevels-1]],cb[lar[nlevels-2]]);
         let modyst_m=modysttoperiod(modyst_m1,cb[lar[nlevels-2]].length-lar[0]+lar[nlevels-2]);
         if(modyst!=modyst_m)
            alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_5: '+modyst_5+'\n\nmodyst: '+modyst+'\n\nmodyst_m1: '+modyst_m1+'\n\nmodyst_m: '+modyst_m);
         }*/

      //if(modyst!=modyst_old)
      //   alert(st+'\n'+convert(st)+'\n\nmodyst_old: '+modyst_old+'\nmodyst: '+modyst);
      //modyst=modyst_old;



      // no overlap
      // cb: [[[Xc]]] → X[
      /*for(i=pn;i<cb.length;i++)
         {while(cb[i][0]=='[')
            cb[i]=cb[i].slice(1);
         cb[i]=cb[i].slice(0,-cb.length+i)+'[';
         }
         
      // largest repeated cb
      let np=cb.length-1;
      for(i=cb.length-2;i>=pn;i--)
         if(cb[i]>cb[np].repeat(Math.ceil(cb[i].length/cb[np].length)))
            np=i;*/





      /*let cbase=Array(cb.length*2-pn);
      for(i=pn;i<cb.length;i++)
         {
         cbase[i]=base(cb[i])+'[';
         cbase[i+cb.length-pn]=cbase[i];
         }
      
      for(e=pn;e<cb.length;e++)
         {
         let bar=Array(cb.length).fill(true);
         cb[e]='';
         for(i=pn;i<cb.length;i++)
            cb[e]+=cbase[e+i-pn];
         let bc=cb.length-pn-1;
         let b=true;
         while(bc&&b)
            {
            b=false;
            let i1;
            for(i=e+pn+1;i<e+cb.length;i++)
            if(bar[i])
               {
               let cbc=cbase[e];
               for(u=e+pn+1;u<e+cb.length;u++)
                  if(bar[u]&&u!=i)
                     cbc+=cbase[u];
               if(infcompare(cbc,cb[e]))
                  {
                  b=true;
                  cb[e]=cbc;
                  i1=i;
                  }
               }
            if(b)
               {
               bar[i1]=false;
               bc--;
               }
            }
         }
         
      for(i=pn;i<cb.length;i++)
      if(cb[i].includes(col))
         while(cb[i][0]=='[')
            cb[i]=cb[i].slice(1)+'[';
      else
         cb[i]='[';
      
      
         
      let prover=Array(cb.length);
      for(i=pn;i<cb.length;i++)
         prover[i]=st0;*/






      /*let bslr=cb[pn1+1];
      let bslr0=bslr;
      let bslr1='';
      while(bslr0.at(-1)=='!')
         {
         bslr0=bslr0.slice(0, -1);
         bslr1=bslr1+'!';
         }
      bslr0=bslr0.slice(0, -1);
      let mper=cb[pn];
      fsperiod0='';
      while(mper&&booster(mper)<bslr)
         {
         i=booster(mper);
         while(i>=col)
            i=booster(i);
         if(bslr0)
            i=bslr0+i+bslr1;
         fsperiod0='['+i+'!'+fsperiod0;
         mper=base(mper);
         }
      fsperiod0=base(cb[pn1])+fsperiod0;*/





      // overlap
      /*let prover=Array(cb.length);
      
      // cb: [[[Xc]]] → X[
      for(i=pn;i<cb.length;i++)
         {while(cb[i][0]=='[')
            {cb[i]=cb[i].slice(1);
            }
         cb[i]=cb[i].slice(0,-cb.length+i)+'[';
         cb[i]=overperiod(cb[i]);
         prover[i]=overprimer(cb[i],st0);
         }*/

      //cb[0]=='c[[c[c!!!![[c[['               // Φ(1, 0)[I]
      //cb[0]=='c[[c[c!!!![['
      //if(st=='[c[[c[c!!!![[c[c!!!')
      //   cb[0]='c[[c[c!!!![c[[';

      /*c
      c[c!
      [c[c!!
      [c[[c[c!!!![[c[c!!!
      
      c[[c[c!!!![[c[[
      
      [
      c[
      [
      c[[c[c!!!![
      */


      //cb[0]='c![[c[c!!![[c[[';               // Ω[I][I]
      //if(st=='[c![[c[c!!![[c[c!!!')
      //   cb[0]='c[c!!![[c[[';

      /*[
      c[
      [
      c[c!!![
      c![[
      */



      /*let cbnew=cb[pn].slice(0,-cb.length+pn);
      
      let pr;
      let per;
      [pr,per]=getprper(cbnew);
      
      let stnew=st0.slice(0,st.length-cbnew.length-cb.length)+pr+per;
      cbnew=per;
      
      let shpos=per.indexOf(col);
      //if(pr=='['&&per=='[c[[')
      if(shpos>0)
         {
         let shp=per.slice(0,shpos);
         stnew+=shp;
         cbnew=per.slice(shpos)+shp;
         }*/





      /*let np=cb.length-1;
      for(i=cb.length-2;i>=pn;i--)
      
         if(prover[i].length+cb[i].length>prover[np].length+cb[np].length)
            {
            if(prover[i]+cb[i]>prover[np]+(cb[np].repeat(Math.ceil((prover[i].length-prover[np].length+cb[i].length)/cb[np].length))))
               np=i;
            }
         else
            if(prover[i]+(cb[i].repeat(Math.ceil((prover[np].length-prover[i].length+cb[np].length)/cb[i].length)))>prover[np]+cb[np])
               np=i;
      //np=pn;
      st0=prover[np];*/




      /*cblen=1;
      cbc=1;
      cpn=pn;
      for(i=pn+1;i<cb.length;i++)
         {
         if(cb[i]!=cb[i-1])
            cblen++;
         if(i==np)
            cbc=cblen;
         }*/





      let rr = modyst.length - getpos(modyst);
      while (rr < 0)
         rr += modyst.length;

      //fsopening=st0.slice(0,-rr);
      rr %= modyst.length;
      fsopening = st0 + modyst.slice(0, -rr);
      //fsopening=modyst.slice(0,-rr);
      fsperiod0 = modyst.slice(-rr) + modyst.slice(0, -rr);

      /*if(st=='[c[[c[c!!!![[c[c!!!')
         //fsperiod0.replace('!!!!', '!!!![c');
         fsperiod0=fsperiod0+'[c';*/

      while (fsopening.slice(-fsperiod0.length) == fsperiod0)
         fsopening = fsopening.slice(0, -fsperiod0.length);

      /*st0=st.slice(0,-cb[pn].length-pn);                        // modstring_new5
      while(st0.slice(-modyst.length)==modyst)
         st0=st0.slice(0,-modyst.length);*/

      st0 = st.slice(0, -cb[pn].length - pn);                      // modstring_new10

      /*if((st0+fsopening).slice(-fsperiod0.length)==fsperiod0)
         {
         fsopening=st0.slice(0,-fsperiod0.length+fsopening.length);
         while(fsopening.slice(-fsperiod0.length)==fsperiod0)
            fsopening=fsopening.slice(0,-fsperiod0.length);
         st0='';
         }*/


      fsperiod1 = '!'.repeat(ocd(fsperiod0));
      fsending = '!'.repeat(ocd(fsopening));



      /*rr=cbnew.length-getpos(cbnew);
      while(rr<0)
         rr+=cbnew.length;
         
         
      //let fsopeningold=stnew.slice(0,-rr);
      rr%=cbnew.length;
      //let fsopeningtest=stnew+cbnew.slice(0,-rr);
      let fsopeningold=stnew+cbnew.slice(0,-rr);
      let fsperiodold0=cbnew.slice(-rr)+cbnew.slice(0,-rr);
      
      //if(st=='[c[[c[c!!!![[c[c!!!')
         //fsperiodold0.replace('!!!!', '!!!![c');
      //   fsperiodold0=fsperiodold0+'[c';
      
      while(fsopeningold.slice(-fsperiodold0.length)==fsperiodold0)
         fsopeningold=fsopeningold.slice(0,-fsperiodold0.length);
         
      //while(fsopeningtest.slice(-fsperiodold0.length)==fsperiodold0)
      //   fsopeningtest=fsopeningtest.slice(0,-fsperiodold0.length);
         
      //if(fsopeningold!=fsopeningtest)
      //   alert(st);
      
      let fsperiodold1='!'.repeat(ocd(fsperiodold0));
      let fsendingold='!'.repeat(ocd(fsopeningold));*/







      //if(!checkboosters(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending))
      //   alert(st+'\n'+convert(st)+'\nnew primer = '+fsopening+'\nnew period = '+fsperiod0+'\nfs new = '+fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending+'\n'+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));

      //if(!checkboosters(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold))
      //   alert(st+'\nold\n'+fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold);




      /*if(fsopening!=fsopening||fsperiodold0!=fsperiod0)
      //if(checkboosters(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending)&&checkboosters(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold)&&(fsopening!=fsopening||fsperiodold0!=fsperiod0))
         {
         //alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
         //alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsperiodold0+fsperiodold1+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
         //alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
         alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
         }*/






      cofcurrent = '[[!!';
      cofclass = 0;
      setfsarrays();

      //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
      fsprimer0 = st0;
      fsending0 = '!'.repeat(ocd(fsprimer0))
      return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn, fsprimer0, fsending0);
   }





   function fsalt(st, n, nn = 0, overtest = false, overl = 0) {

      // optimization
      if (st == fscurrent)
         return st;

      // limit rule
      if (st == bo) {
         return st;
      }

      let i = st.length - 1;
      while (st[i] == '!')
         i--;
      let e = st[i] == '[';
      let st0 = st.slice(0, i);
      let st1 = st.slice(i + (e ? 2 : 1));
      let s1;

      // successor and plain rule
      if (e) {
         return st;
      }

      // main rule
      let stt = st0;
      let u = i - 1;

      while (st0[u] == '[')
         u--;
      u = i - u - 1;

      st0 += '[';

      st1 = st1.slice(u);
      let s;

      u++;
      let uo = '['.repeat(u);

      let cb = [st];
      //let nc=[1,1];
      while (cb.at(-1).length > 1) {
         cb.push(booster(cb.at(-1)));
      }

      let pn = cb.length - 1;
      let nl = nlevels;
      let lr = 'c';
      let lar = [pn];
      while (nl) {
         if (cb[pn] < lr) {
            lr = cb[pn];
            lar.push(pn);
            nl--;
         }
         else {
            pn--;

            // cof > ω
            if (pn < 0) {
               return st;
            }

         }
      }



      let np;
      if (overtest) {
         // no overlap
         // cb: [[[Xc]]] → X[
         for (i = pn; i < cb.length; i++) {
            while (cb[i][0] == '[')
               cb[i] = cb[i].slice(1);
            cb[i] = cb[i].slice(0, -cb.length + i) + '[';
         }

         // largest repeated cb
         np = cb.length - 1;
         for (i = cb.length - 2; i >= pn; i--)
            if (cb[i] > cb[np].repeat(Math.ceil(cb[i].length / cb[np].length)))
               np = i;

         while (st0.length < overl)
            st0 += cb[np];

         return st0.slice(0, overl);
      }
      else {

         // overlap
         let prover = Array(cb.length);

         // cb: [[[Xc]]] → X[
         for (i = pn; i < cb.length; i++) {
            while (cb[i][0] == '[') {
               cb[i] = cb[i].slice(1);
            }
            cb[i] = cb[i].slice(0, -cb.length + i) + '[';
            cb[i] = overperiod(cb[i]);
            prover[i] = overprimer(cb[i], st0);
         }

         np = cb.length - 1;
         for (i = cb.length - 2; i >= pn; i--)

            if (prover[i].length + cb[i].length > prover[np].length + cb[np].length) {
               if (prover[i] + cb[i] > prover[np] + (cb[np].repeat(Math.ceil((prover[i].length - prover[np].length + cb[i].length) / cb[np].length))))
                  np = i;
            }
            else
               if (prover[i] + (cb[i].repeat(Math.ceil((prover[np].length - prover[i].length + cb[np].length) / cb[i].length))) > prover[np] + cb[np])
                  np = i;

         st0 = prover[np];

         let overstring = st0;
         let overor = st0 + cb[np];
         i = -1;
         while (true) {
            i++;
            if (i >= overstring.length)
               overstring += cb[np];
            if (overstring[i] == '[' && (!i || overstring[i - 1] == '[')) {
               let overnsform = overstring.slice(0, i);
               overnsform = overnsform + col + ('!'.repeat(ocd(overnsform)));
               let efs = fsalt(overnsform, '', 0, true, overor.length);
               if (efs == overor)
                  return overnsform;
            }
         }
      }
   }



   // is st ε number
   function isepsilon0(st) {
      return st == '' ? false : st == col || st == bo ? true : compare(st, booster(st)) < 1;
   }     // original
   //return st==''?false:st==col||st==bo?true:(base(st)==''||isepsilon(base(st)))&&compare(st,booster(st))<1;}  // for non-standard forms

   // largest ε number ≤ CNF st (if st < ε_0 then '')
   function floorepsilon(st) {
      if (!Array.isArray(st))
         return st;
      let t = st[st.length - 1][0];
      while (Array.isArray(t) && t != 0) {
         st = t;
         t = st[st.length - 1][0];
      }
      return t;
   }

   // is st Ω number
   function isOmega(st) {
      //return st==''?false:st==col||st==bo?true:compare(col,booster(st))<1;
      return st == '' || st == bo ? false : st == col ? true : st < col && compare(col, booster(st)) < 1;
   }


   // remove boosters of st < c
   function floorOmega(st, c = col) {
      //while(st!=''&&st!=col&&st!=c&&compare(c,booster(st))==1)
      while (st != '' && st != col && st != c && compare(c, booster(st)) == 1)
         //while(st!=''&&(compare(c,st)==1||compare(c,booster(st))==1))
         st = base(st);
      return st;
   }

   function sepsilon(st, e) {
      let s = st[st.length - 1];
      if (s[0] == e)
         if (s[1] == 1)
            st.pop();
         else
            s[1]--;
      return st.length ? st : '';
   }

   function braintail(st, e) {
      let bra, i = 0, s = [];
      while (floorepsilon([st[i]]) != e)
         i++;
      let u = i;
      while (i < st.length) {
         s.push([st[i][0] == e ? '' : sepsilon(st[i][0], e), st[i][1]]);
         i++;
      }
      let tail = st.slice(0, u);
      if (!tail.length)
         tail = '';
      else if (tail.length == 1 && tail[0][1] == 1 && tail[0][0] != '' && !Array.isArray(tail[0][0]))
         tail = tail[0][0];
      return [s, tail];
   }

   // ω ^ CNF st
   function omegapower(st) {
      if (st != '' && !Array.isArray(st))
         return st;
      return [[st, 1]];
   }

   // compare CNFs st1, st2 (if st1<st2 then -1; if st1==st2 then 0; if st1>st2 then 1)
   function comparecnf(st1, st2) {
      if (st1.toString() == st2.toString())
         return 0;
      if (st1 == '')
         return -1;
      if (st2 == '')
         return 1;
      let b1 = !Array.isArray(st1);
      let b2 = !Array.isArray(st2);
      if (b1 && b2)
         return compare(st1, st2);
      let c;
      if (b1) {
         c = compare(st1, floorepsilon(st2));
         return c == 0 ? -1 : c;
      }
      if (b2) {
         c = compare(floorepsilon(st1), st2);
         return c == 0 ? 1 : c;
      }
      /*b1=st1[0].length==2;            // to compare CNF and extended CNF
      b2=st2[0].length==2;
      if(b1^b2){
         if(b1)
            st1=cnf(st1,true);
         else
            st2=cnf(st2,true);
         }*/
      let i1 = st1.length - 1;
      let i2 = st2.length - 1;
      do {
         //if(b1&&b2){                  // to compare CNF and extended CNF
         if (st1[0].length == 2 && st2[0].length == 2) {
            c = comparecnf(st1[i1][0], st2[i2][0]);
            if (c != 0)
               return c;
            c = st1[i1][1] > st2[i2][1] ? 1 : st1[i1][1] < st2[i2][1] ? -1 : 0;
         }
         else {
            c = compare(st1[i1][0], st2[i2][0]);
            if (c != 0)
               return c;
            c = comparecnf(st1[i1][1], st2[i2][1]);
            if (c != 0)
               return c;
            c = comparecnf(st1[i1][2], st2[i2][2]);
         }
         if (c != 0)
            return c;
         i1--;
         i2--;
      }
      while (i1 >= 0 && i2 >= 0);
      //if(i1<0&&i2<0)                // to compare CNF and extended CNF
      //   return 0;
      if (i1 < 0)
         return -1;
      return 1;
   }

   // CNF st1 + CNF st2 
   function sumcnf(st1, st2) {
      if (st1 == '')
         return st2;
      if (st2 == '')
         return st1;
      if (!Array.isArray(st1)) {
         let z1 = st1;
         st1 = [[st1, 1]];
      }
      if (!Array.isArray(st2)) {
         let z2 = st2;
         st2 = [[st2, 1]];
      }
      let b1 = st1[0].length == 2;
      let b2 = st2[0].length == 2;
      if (b1 ^ b2) {
         if (b1)
            st1 = [[z1 === undefined ? floorepsilon(st1) : z1, '', st1]];
         else
            st2 = [[z2 === undefined ? floorepsilon(st2) : z2, '', st2]];
      }
      let s = st2.slice(-1);
      let i = 0;
      if (b1 && b2) {
         let c = comparecnf(s[0][0], st1[i][0]);
         while (c > 0) {
            i++;
            if (i < st1.length)
               c = comparecnf(s[0][0], st1[i][0]);
            else
               break;
         }
         if (i == st1.length)
            return st2;
         if (c == 0) {
            st1[i][1] += s[0][1];
            st2.pop();
         }
      }
      else {
         let c0 = compare(s[0][0], st1[i][0]);
         let c1 = comparecnf(s[0][1], st1[i][1]);
         while (c0 > 0 || (c0 == 0 && c1 > 0)) {
            i++;
            if (i < st1.length) {
               c0 = compare(s[0][0], st1[i][0]);
               c1 = comparecnf(s[0][1], st1[i][1]);
            }
            else
               break;
         }
         if (i == st1.length)
            return st2;
         if (c0 == 0 && c1 == 0) {
            st1[i][2] = sumcnf(st1[i][2], s[0][2]);
            st2.pop();
         }
      }
      return st2.concat(st1.slice(i));
   }

   // get CNF of st
   function cnf(st, ext = false, b = true) {
      if (!Array.isArray(st) && (st == '' || isepsilon0(st)))
         return st;
      let c = [];
      if (ext) {
         if (!Array.isArray(st))
            st = cnf(st);
         if (floorepsilon(st) == '')
            return st;
         let s, t, i = -1, e, brain, m, y = -1, h;
         for (s of st) {
            h = false;
            e = floorepsilon([s]);
            if (e == '') {
               brain = '';
               m = s;
            }
            else if (s[0] == e) {
               brain = '';
               m = ['', s[1]];
            }
            else {
               [brain, t] = braintail(s[0], e);
               if (brain.length == 1 && !brain[0][0].length && brain[0][1] == 1)
                  brain = '';
               m = [t, s[1]];
               h = t != '' && s[1] == 1 && !Array.isArray(t);
            }
            if (i < 0 || c[i][0] != e || c[i][1].toString() != brain.toString()) {
               c.push([e, brain, h ? t : [m]]);
               i++;
            }
            else {
               if (!Array.isArray(c[i][2]))
                  c[i][2] = [[c[i][2], 1]];
               c[i][2].push(m);
            }
         }

         if (b)
            for (s of c) {
               s[1] = cnf(s[1], true);
               s[2] = cnf(s[2], true);
            }
      }
      else {
         let s, t, i = -1;
         while (st) {
            [s, st] = isepsilon0(st) ? [st, ''] : [booster(st), base(st)];
            if (c.length == 0 || compare(t, s) < 1) {
               if (i < 0 || c[i][0] != s) {
                  c.push([s, 1]);
                  i++;
               }
               else
                  c[i][1]++;
               t = s;
            }
         }
         for (s of c)
            s[0] = cnf(s[0]);
      }
      return c;
   }

   function unone(st) {
      return st == '1' ? '' : st;
   }

   function displayform(st, ext = false) {
      if (st == '')
         return 0;
      if (!Array.isArray(st))
         //return convertepsilon0(st,ext);
         return convertepsilon(st);
      if (ext) {
         if (st[0].length == 2)
            return displayform(st);
         let i = st.length - 1;
         let s = '';
         let e, ex, m;
         while (i >= 0) {
            s += ' + ';
            e = st[i][0];
            if (e == '')
               s += displayform(st[i][2]);
            else {
               //s+=convertepsilon0(e,true);
               s += convertepsilon(e);
               ex = st[i][1];
               m = displayform(st[i][2], true);
               if (Array.isArray(st[i][2]) && st[i][2].length > 1)
                  m = '<span style="color: #666666; font-weight: bold;">(</span>' + m + '<span style="color: #666666; font-weight: bold;">)</span>';
               else
                  m = unone(m);
               if (ex != '')
                  s += '<sup>' + displayform(ex, true) + '</sup>';
               else if (m && (s[s.length - 1] == '!' || m[0] == '['))
                  //else if(m)
                  s += '·';
               s += m;
            }
            i--;
         }
         return s.slice(3);
      }
      else {
         let i = st.length - 1;
         let s = '';
         let ex;
         while (i >= 0) {
            s += ' + ';
            ex = st[i][0];
            if (Array.isArray(ex)) {
               s += '<span style="color: #ff0000; font-weight: bold;">ω</span>';
               if (ex.length != 1 || ex[0][0] != 0 || ex[0][1] != 1)
                  s += '<sup>' + displayform(ex) + '</sup>';
               s += unone(st[i][1]);
            }
            else if (ex == '')
               s += st[i][1];
            else {
               //s+=convertepsilon0(ex);
               s += convertepsilon(ex);
               if (st[i][1] != '1') {
                  if (s[s.length - 1] == '!')
                     s += '·';
                  s += st[i][1];
               }
            }
            i--;
         }
         return s.slice(3);
      }
   }

   function getle(cf, x, ex, b) {
      let le = '';
      if (b) {
         let u = 0;
         while (comparecnf(cf, [ex[u]]) > 0)
            u++;
         if (u > 0)
            le = ex.slice(0, u);
      }
      if (le.length == 1 && le[0][1] == 1 && le[0][0] != '' && !Array.isArray(le[0][0]))
         return le[0][0];
      else
         return omegapower(le);
      return le;
   }

   function cnftoarray(eex, ext, f, le = '-') {

      // Klammersymbolen

      //if(ext)
      //   eex=cnf(JSON.parse(JSON.stringify(ex)),true);

      let s = '';
      let i, j, p, pp, m;

      if (Array.isArray(eex)) {
         /*for(i=0;i<eex.length;i++)
            if(!Array.isArray(eex[i][0]))
               eex[i][0]=cnf(eex[i][0],true,false);*/
         i = eex.length - 1;

         //while(eex[i][0]!=f)i--;
         //while(i>=0&&(!Array.isArray(eex[i][0])||eex[i][0]!=f))i--;
         while (i >= 0 && (eex[i][0] != f)) i--;
         if (i >= 0) {
            p = eex[i][1];
            if (!p) p = [["", 1]]
            //else if(ext)p=cnf(p,true);
            //p=p?p[0][1]:1;
            m = eex[i][2];
            j = i;
            while (j >= 0 && (eex[j][0] == f)) j--;
         }
         else
            j = eex.length - 1;

      }

      if (le == '-')
         le = displayform(eex.slice(0, j + 1), ext);

      if (i >= 0) {
         while (i >= 0 && eex[i][0] == f) {
            s += ', ';
            if (ext)
               m = cnf(m, true);
            //m=sepatosepsum(soptosepa(stringtosop(m)));
            s += displayform(m, ext);

            pp = [...p];

            i--;
            if (i >= 0) {
               p = eex[i][1];
               m = eex[i][2];
               if (!p) p = [["", 1]]
               //else if(ext)p=cnf(p,true);
            }

            if (!pp[0][0]) {
               let q = pp[0][1];
               if (i >= 0 && eex[i][0] == f)
                  if (!p[0][0] && JSON.stringify(pp.slice(1)) == JSON.stringify(p.slice(1))) {
                     q -= p[0][1];
                     s += ', 0'.repeat(q - 1);
                  }
                  else if (p[0][0] && JSON.stringify(pp.slice(1)) == JSON.stringify(p))
                     s += ', 0'.repeat(q - 1);
                  else
                     s += ', 0'.repeat(q) + ' @<sup>' + cnftoarray(JSON.parse(JSON.stringify(cnf(pp.slice(1), true, false))), ext, f) + '</sup>';
               //s+=', 0'.repeat(q)+' @<sup>'+cnftoarray(JSON.parse(JSON.stringify(sepatosepsum(soptosepa(stringtosop(pp.slice(1)))))),ext,f)+'</sup>';
               else {
                  if (pp.length > 1)
                     s += ', 0'.repeat(q) + ' @<sup>' + cnftoarray(JSON.parse(JSON.stringify(cnf(pp.slice(1), true, false))), ext, f) + '</sup>';
                  //s+=', 0'.repeat(q)+' @<sup>'+cnftoarray(JSON.parse(JSON.stringify(sepatosepsum(soptosepa(stringtosop(pp.slice(1)))))),ext,f)+'</sup>';
                  else
                     s += ', 0'.repeat(q - 1);

               }
            }
            else {
               s += ' @<sup>' + cnftoarray(JSON.parse(JSON.stringify(cnf(pp, true, false))), ext, f) + '</sup>';
               //s+=' @<sup>'+cnftoarray(JSON.parse(JSON.stringify(sepatosepsum(soptosepa(stringtosop(pp))))),ext,f)+'</sup>';
            }
         }
         if (le != '-')
            if ((pp[0][0] || pp.length > 1) && le == '0')
               le = '';
            else le = ', ' + le;
         s = s.slice(2);
      }

      if (le == '-')
         le = '';

      return s + le;
   }

   function mtoc(st, n = 0) {
      let m = '[c[c[c!!!';
      if (st == col || !st || (n <= 0 && st < m))
         return st;
      if (st == m)
         return col;
      return bb(mtoc(base(st), n), mtoc(booster(st), n - 1));
   }

   function finremc(st) {
      if (st.length < 2)
         return st;
      let x1 = st;
      let x2 = '';
      let y1 = booster(x1);
      while (y1 < col) {
         x2 = bb('', y1) + x2;
         x1 = base(x1);
         y1 = x1 == col ? 'c[c!' : booster(x1);
      }
      if (booster(x1) == col) {
         let x5 = x1;
         while (booster(x5) == col)
            x5 = base(x5);
         x5 = booster(x5);
         x5 = x5 ? booster(x5) : col;
         while (x5 >= '[c[c[c!!!' && x5 < col)
            x5 = x5 ? booster(x5) : col;
         if (x5 >= 'c[c[c!!')
            return base(x1) + x2;
      }
      return st;
   }

   function checkpolynomial(beta, x, f) {
      if (x < f)
         return compare(x, beta);
      let r = stringslice(x, '', f);
      let c, ex;
      if (r) {
         c = compare(r, beta);
         if (c > 0)
            return 1;
         ex = stringtosepsum(stringslice(x, f));
      }
      else {
         ex = stringtosepsum(stringslice(x, f));
         c = compare(ex[0][2], beta);
         if (c > 0)
            return 1;
         if (c == 0) {
            if (checkpolynomial(beta, ex[0][1], f) >= 0)
               return 1;
         }
         else if (ex[0][2] == '[!') {
            c = checkpolynomial(beta, ex[0][1], f);
            if (c > 0)
               return 1;
         }
         else if (checkpolynomial(beta, ex[0][1], f) >= 0)
            return 1;
      }
      for (let e = r ? 0 : 1; e < ex.length; e++)
         if (checkpolynomial(beta, ex[e][1], f) >= 0 || checkpolynomial(beta, ex[e][2], f) >= 0)
            return 1;
      return c;
   }

   function convertepsilon0(st, ext = false) {
      if (!nlevels && st == col)
         return 'ε<sub>0</sub>';

      if (nlevels == 1 && st == col)
         return sugar[33] ? convertsubscript(sugar[33] ? 'ℵ' : '<span style="color: #ff0000; font-weight: bold;">ω</span>', convertone()) : '<span style="color: #001aff; font-weight: bold;">Ω</span>';

      if (st == col || st == bo)
         return st;

      //if(st=='[c[c[c[c!!!!')
      //   return 'K';  

      /*if(spn)
         {
         if(st=='[[c![[c![[c![!!!!')
            return 'SVO';
         else if(st=='[[c![[c![[c![[c!!!!!')
            return 'LVO';
         else if(st=='[[c![c!!')
            return 'BHO';
         else if(st=='[[c[!!!')
            return 'BO';
         else if(st=='[[c[!![c!!')
            return 'TFB';
         else if(st=='[[c[c!!!')
            return 'EBO';
         else if(st=='[[c[c!![c!!')
            return 'SRO';
         else if(st=='[[c[c[c!!![c!!')
            return 'RO';
         //else if(st=='[c[c[c[c!!!!')
         //   return 'k';
         }*/

      /*if(st=='[[[[c!c!!c!')   
         return 'I';
      if(st=='[c[c[c!!!')   
         return 'M';*/
      let x = booster(st);
      let beta = base(st);

      let sy = '';
      let f = floorOmega(x);
      //let j,maxx,ff;
      let j, maxx;
      //let exa;

      let f1 = card(x);
      let f2 = ecard(beta);
      //f2=nexteps(ecard(beta),1);
      //let l=nexteps(f2,2);

      //if(f1==f2)
      if (f1 == nexteps(f2, 1)) {
         sy = 'φ';
         f = f1;
         j = f;
         maxx = nexteps(f);
      }
      //else if(f1==l)
      /*else if(floorOmega(x,l)==l)
         {
         sy='Φ';
         f=bb(l,l);
         f=bb(beta,f);
         j=bb(l,f);
         j=bb(beta,j);
         maxx=bb(l,nexteps(f));
         }*/
      else if (f == col) {
         sy = 'Φ';
         //ff=bb(col,col);
         //f=bb(floorOmega(beta,ff),ff);
         f = bb(col, col);
         f = bb(floorOmega(beta, f), f);
         j = bb(col, f);
         j = bb(floorOmega(beta, j), j);
         //maxx=bb(col,bb(f,bb(f,bb(f,''))));
         //maxx=bb(col,bb(f,bb(f,'')));
         //maxx=bb(col,bb(f,bb(f,f)));
         //maxx=bb(col,bb(f,col));
         maxx = bb(col, bb(f, bb(f, col)));
         //ff=fs(ff,f);
      }
      else if (f == bb(col, col)) {
         sy = 'I-Φ';
         f = bb(f, col);
         f = bb(floorOmega(beta, f), f);
         j = bb(bb(col, col), f);
         j = bb(floorOmega(beta, j), j);
         //maxx=bb(bb(col,col),bb(f,bb(f,'')));
         //maxx=bb(bb(col,col),bb(f,bb(f,f)));
         //maxx=bb(bb(col,col),bb(f,col));
         maxx = bb(bb(col, col), bb(f, bb(f, col)));
      }
      /*else if(f==bb(col,col)){
         sy='L';
         j=bb(col,col);
         j=bb(j,col);
         j=bb(floorOmega(beta,j),j);
         j=bb(col,j);
         j=bb(floorOmega(beta,j),j);  
         }
      else if(f==bb(col,bb(col,col))){
         sy='R';
         j=bb(col,col);
         j=bb(j,col);
         j=bb(j,col);
         j=bb(floorOmega(beta,j),j);
         j=bb(col,j);
         j=bb(floorOmega(beta,j),j); 
         }*/
      /*else if(f==bb(floorOmega(beta),col)){
         sy='φ';
         j=f;
         //maxx=bb(f,bb(f,bb(f,'')));
         //maxx=bb(f,bb(f,bb(f,f)));
         maxx=bb(f,bb(f,col));
         //ff=f;
         }*/
      /*else if(x>col){
         sy='I';
         f=col;
         j=f;
         maxx='d';
         }*/
      else if (x >= 'c[c[c!!' && st < '[c[c[c!![[c[c[c!![c!!!!') {
         sy = 'M';
         //f='[c[c[c!!!';
         f = col;
         j = f;
         maxx = 'd';
      }
      else if (x >= 'c[c[c[c!!!' && st < '[c[c[c[c!!![[c[c[c[c!!![c!!!!') {
         sy = 'K';
         //f='[c[c[c!!!';
         f = col;
         j = f;
         maxx = 'd';
      }
      //else if(x>col&&x<'c[c[[c[c[c!!![[c[c[c!!![c!!!!')
      else if (x > col && x < 'c[c[[c[c[c!!![[c[c[c!!![c!!!!' && x < bb(f, bb(floorOmega(beta, bb(f, col)), bb(f, col)))) {

         //if(x>=bb(f,bb(floorOmega(beta,bb(f,col)),bb(f,col))))
         //   alert('['+convert(x)+']');

         let beta1 = beta;
         while (beta1 && booster(beta1) < 'c[c[c!!')
            beta1 = base(beta1);
         beta1 = bb(beta1, 'c[c[c!!');
         if (x < bb(col, bb(col, bb(beta1, bb(beta1, col))))) {
            let x1 = x;
            let x2 = '';
            let y1 = booster(x1);
            //while(y1<'c[[c[c[c!!!!')
            while (y1 < col) {
               x2 = bb('', y1) + x2;
               x1 = base(x1);
               y1 = x1 == col ? 'c[c!' : booster(x1);
            }
            //if(x<'c[c[[c[c[c!!!!!'||x2>='[c!')
            let x4 = booster(x1);
            x4 = x4 ? booster(x4) : col;
            //while(x4&&x4<col)
            while (x4 >= '[c[c[c!!!' && x4 < col)
               //while(x4>=beta1&&x4<col)                                                                                // *
               //while(x4>='[c[c[c!!!'&&x4<col&&st!='[c[c[c!!![c[c[[c[c[c!!!!!!')
               //while(x4>=(st=='[c[c[c!!![c[c[[c[c[c!!!!!!'?'[c[c[c!!![c[c[c!!!':'[c[c[c!!!')&&x4<col)
               x4 = x4 ? booster(x4) : col;
            //if(x5>='[c[c[c!!!')

            //if(x<'c[c[[c[c[c!!!!!'||x2>='[c!'||(x>='c[c[[c[c[c!!!!!'&&x4<'[c[c[c!!!'))
            //if(x<'c[c[[c[c[c!!!!!'||x2>='[c!'||x4<'[c[c[c!!!')
            //if(x4<'[c[c[c!!!')
            if (x4 < 'c[c[c!!')
            //if(x4<'c[c[c!!'||st=='[c[c[c!!![c[c[[c[c[c!!!!!!')                                                     // *
            {
               /*let x3=x;
               while(booster(x3)<col)
                  x3=base(x3);
               x3=bb(x3,col);*/
               let x3 = bb(x1, col);
               x3 = bb(beta, x3);
               if (x2 < x3) {
                  //if(x1>col&&x2.length>2&&x2.slice(0,3)=='[c!')
                  //   x2=x2.slice(3);
                  /*if(booster(x1)==col)
                     {
                     let x5=x1;
                     while(booster(x5)==col)
                        x5=base(x5);
                     x5=booster(x5);
                     x5=x5?booster(x5):col;
                     if(x5>='[c[c[c!!!')
                        x1=base(x1);
                     //x1=base(x1);
                     }*/

                  if (x >= 'c[c[[c[c[c!!!!!')
                  //if(x>=bb(col,bb(col,beta1)))                                                                // *
                  //if(x>='c[c[[c[c[c!!!!!'&&st!='[c[c[c!!![c[c[[c[c[c!!!!!!')
                  {
                     x1 = finremc(x1);
                     while (x1 > col) {
                        x2 = bb('', mtoc(booster(x1))) + x2;
                        x1 = base(x1);
                     }
                     let x5 = '';
                     while (beta.length > 1) {
                        x5 = bb('', finremc(booster(beta))) + x5;
                        beta = base(beta);
                     }
                     beta += x5;
                     beta = mtoc(beta, 2);
                     x = col + x2;
                  }

                  sy = 'I';
                  f = col;
                  j = f;
                  maxx = 'd';
               }
            }
         }
      }
      else if (f == bb(bb(col, col), col)) {
         sy = 'I(1, •)-Φ';
         let ff = f;
         f = bb(f, col);
         f = bb(floorOmega(beta, f), f);
         j = bb(ff, f);
         j = bb(floorOmega(beta, j), j);
         maxx = bb(ff, bb(f, bb(f, col)));
      }
      else if (f == bb(bb(bb(col, col), col), col)) {
         sy = 'I(2, •)-Φ';
         let ff = f;
         f = bb(f, col);
         f = bb(floorOmega(beta, f), f);
         j = bb(ff, f);
         j = bb(floorOmega(beta, j), j);
         maxx = bb(ff, bb(f, bb(f, col)));
      }
      else if (booster(f) == col) {
         sy = 'I(x, •)-Φ';
         let ff = f;
         f = bb(f, col);
         f = bb(floorOmega(beta, f), f);
         j = bb(ff, f);
         j = bb(floorOmega(beta, j), j);
         maxx = bb(ff, bb(f, bb(f, col)));
      }
      /*else if(compare(bb(col,col),x)<1){
      //else if(beta==''&&compare(bb(col,col),x)<1){
         sy='I';
         f=col;
         j=f;
         maxx=bb(f,bb(f,bb(f,'')));
         }*/
      //if(sy!=''&&compare(bb(f,bb(f,bb(f,''))),x)>0&&(sy!='Ω'||compare(bb(col,j),x)==1)){
      //if(sy!=''&&compare(bb(f,bb(f,bb(f,''))),x)>0){
      if (sy != '' && compare(maxx, x) > 0) {
         //{
         let cf = cnf(f);
         let fx = floorOmega(x, f);
         let ex = cnf(x);
         let eex = cnf(JSON.parse(JSON.stringify(x)), true, false);
         //let eex=sy=='I'?exa:cnf(JSON.parse(JSON.stringify(x)),true,false);
         //let eex=cnf(JSON.parse(JSON.stringify(ex)),true,false);
         //let eex=cnf(JSON.parse(JSON.stringify(ex)),true);
         //let eex=cnf(ex,true,false);
         let le = getle(cf, x, ex, x != f && eex[0][0] != f);
         while (beta) {
            let x1 = booster(beta);
            let fx1 = floorOmega(x1, j);
            if (fx1 == fx) {
               let ex1 = cnf(x1);
               //le=sumcnf(getle(cf,x1,ex1,x1!=j&&cnf(ex1,true,false)[0][0]!=j),le);
               le = sumcnf(getle(cf, x1, ex1, x1 != j && cnf(JSON.parse(JSON.stringify(x1)), true, false)[0][0] != j), le);
               //le=sumcnf(getle(cf,x1,ex1,x1!=j&&cnf(JSON.parse(JSON.stringify(ex1)),true,false)[0][0]!=j),le);
               //le=sumcnf(getle(cf,x1,ex1,x1!=j&&cnf(JSON.parse(JSON.stringify(ex1)),true)[0][0]!=j),le);
               beta = base(beta);
            }
            else {
               //if(fx==ff)
               //if(comparecnf(fx,ff)<1)
               if (!Array.isArray(eex))
                  le = sumcnf(beta, le);
               else {
                  let u = eex.length - 1;
                  //while(u>=0&&eex[u][0]==f)
                  //alert(st);
                  //if((u>=0&&compare(f,eex[u][0])<1)!=(u>=0&&comparecnf(f,eex[u][0])<1))
                  //   alert(st);
                  //while(u>=0&&compare(f,eex[u][0])<1)


                  /*
                  while(u>=0&&comparecnf(f,eex[u][0])<1)
                     u--;
                  u++;
                  let ca=comparecnf(eex[u][2],cnf(beta));
                  if(ca<1&&eex.length>1)
                     while(u<eex.length-1&&comparecnf(f,eex[u][0])<1)
                        {
                        u++;
                        if(comparecnf(cnf(beta),eex[u][2])<1)
                           {
                           ca=1;
                           break;
                           }
                        }
                  */

                  //let iex=cnf(fx,true);

                  let ca = checkpolynomial(beta, fx, f);

                  le = sumcnf(ca == 1 ? '' : ca == 0 ? [['', 1]] : beta, le);
                  //if(ca>0)
                  //alert(st+'\n'+beta);
                  //window.prompt(beta, st);
               }
               break;
            }
         }
         //if(sy!='φ'&&(sy!='Φ'||(sugar[34]&&fx==col))&&(sy!='I-Φ'||fx==bb(col,col))&&sy!='I'&&le.length==1&&le[0][1]==1&&le[0][0]=='')
         if (sy != 'φ' && (sy != 'Φ' || (sugar[34] && fx == col)) && (sy != 'I-Φ' || fx == bb(col, col)) && (sy != 'I(1, •)-Φ' || fx == bb(bb(col, col), col)) && (sy != 'I(2, •)-Φ' || fx == bb(bb(bb(col, col), col), col)) && (sy != 'I(x, •)-Φ' || booster(fx) == col) && sy != 'I' && le.length == 1 && le[0][1] == 1 && le[0][0] == '')
            //if(sy!='φ'&&(sy!='Φ'||fx==l)&&(sy!='I-Φ'||fx==bb(l,l))&&sy!='I'&&le.length==1&&le[0][1]==1&&le[0][0]=='')
            le = '';
         else {
            if (ext)
               le = cnf(le, true);
            le = displayform(le, ext);
            //if((sy=='φ'||(sy=='Φ'&&fx!=col)||(sy=='I-Φ'&&fx!=bb(col,col))||sy=='I')&&isFinite(le))
            if ((sy == 'φ' || (sy == 'Φ' && fx != col) || (sy == 'I-Φ' && fx != bb(col, col)) || (sy == 'I(1, •)-Φ' && fx != bb(bb(col, col), col)) || (sy == 'I(2, •)-Φ' && fx != bb(bb(bb(col, col), col), col)) || (sy == 'I(x, •)-Φ' && booster(fx) != col) || sy == 'I') && isFinite(le))
               le--;
         }
         if (sy == 'φ') {
            if (fx == f)
               return 'ε<sub>' + le + '</sub>';
            if (fx == bb(f, f))
               return 'ζ<sub>' + le + '</sub>';
            if (fx == bb(bb(f, f), f))
               return 'η<sub>' + le + '</sub>';
            if (fx == bb(f, bb(f, f)))
               return 'Γ<sub>' + le + '</sub>';
         }
         if (sy == 'Φ' && fx == col)
            //return (sugar[33]?'ℵ':'Ω')+(le==''?'':'<sub>'+le+'</sub>');
            return le == '' ? (sugar[34] ? '<span style="color: #001aff; font-weight: bold;">Ω</span>' : '<span style="color: #001aff; font-weight: bold;">ℵ</span>') : convertsubscript(sugar[34] ? '<span style="color: #001aff; font-weight: bold;">Ω</span>' : sugar[33] ? '<span style="color: #001aff; font-weight: bold;">ℵ</span>' : '<span style="color: #ff0000; font-weight: bold;">ω</span>', le);
         if (sy == 'I-Φ' && fx == bb(col, col))
            //return 'I'+(le==''?'':'<sub>'+le+'</sub>');
            return le == '' ? '<span style="color: #8d8d8d; font-weight: bold;">I</span>' : convertsubscript('<span style="color: #8d8d8d; font-weight: bold;">I</span>', le);
         //if(sy!='φ'&&sy!='Φ'&&sy!='I-Φ')
         //   return sy+(le==''?'':'<sub>'+le+'</sub>');
         //if(sy=='M'&&fx=='c[c[c!!')
         if (sy == 'M')
            //return 'M'+(le==''?'':'<sub>'+le+'</sub>');
            return le == '' ? '<span style="color: #8d8d8d; font-weight: bold;">M</span>' : convertsubscript('<span style="color: #8d8d8d; font-weight: bold;">M</span>', le);
         if (sy == 'K')
            return le == '' ? '<span style="color: #8d8d8d; font-weight: bold;">K</span>' : convertsubscript('<span style="color: #8d8d8d; font-weight: bold;">K</span>', le);

         // old version (without @)	
         /*	   
         if(Array.isArray(eex)){
            i=eex.length-1;
            while(eex[i][0]!=f)i--;
            p=eex[i][1];
            p=p?p[0][1]:1;
            m=eex[i][2];
            }
         else{
            i=0;
            p=1;
            m=[["",1]];
            }
         let q=p;
         while(q>0){
            s+=', ';
            if(q==p){
               i--;
               if(ext)
                  m=cnf(m,true);
               s+=displayform(m,ext);
               if(i>=0){
                  p=eex[i][1];
                  m=eex[i][2];
                  p=eex[i][0]!=f?0:p==''?1:p[0][1];}
               }
            else
               s+=0;
            q--;
            }
            */

         if (sy == 'I') {
            let lene = eex.length - 1;
            if (!eex[lene][1]) {
               let lenee = eex[lene][2].length - 1;
               if (!eex[lene][2][lenee][0])
                  //eex[lene][2][lenee][1]--;
                  eex[lene][2][lenee][1] -= 2;
            }
         }

         let s = cnftoarray(eex, ext, f, le);

         //return sy+'('+s.slice(2)+', '+le+')';   
         //return sy+'('+s.slice(2)+le+')';
         return sy + '<span style="color: #666666; font-weight: bold;">(</span>' + s + '<span style="color: #666666; font-weight: bold;">)</span>';
      }
      return bb(beta == '' ? '' : (displayform(cnf(beta, ext), ext)), displayform(cnf(x, ext), ext));
   }

   function convert_old(st) {
      return (format > 1 ? st : displayform(cnf(st, format), format)).toString().replaceAll('!', ']');
   }
   //return (format>1?st:JSON.stringify(cnf(st,format))).toString().replaceAll('!',']').replaceAll('"','');}

   //function convert(st,b=true){
   function convert0(st, b = sugar[4]) {
      //if(b||!st||st==col||st==bo)
      if (!b || !st || st == col || st == bo) {
         if (format < 2 && (st == '[[c![[c![[c![!!!!' || st == '[[c![[c![[c![[c!!!!!' || st == '[[c![c!!' || st == '[[c[!!!' || st == '[[c[!![c!!' || st == '[[c[c!!!' || st == '[[c[c!![c!!' || st == '[[c[c[c!!![c!!'))
            spn = false;
         let s = (format > 1 ? st : displayform(cnf(st, format), format)).toString().replaceAll('!', ']');
         //if(format<2)
         if (!sugar[4] && format < 2) {
            if (st == '[[c!!')
               s += ' <small>(Small Cantor ordinal)</small>';
            else if (st == '[[c![[c!!!')
               s += ' <small>(Cantor ordinal)</small>';
            else if (st == '[[c![[c!![[c!!!')
               s += ' <small>(Large Cantor ordinal)</small>';
            else if (st == '[[c![[c![[c!!!!')
               s += ' <small>(Feferman–Schütte ordinal)</small>';
            else if (st == '[[c![[c![[c!![[c!!!!')
               s += ' <small>(Ackermann ordinal)</small>';
            else if (st == '[[c![[c![[c![!!!!')
               s += ' <small>(Small Veblen ordinal, SVO)</small>';
            else if (st == '[[c![[c![[c![[c!!!!!')
               s += ' <small>(Large Veblen ordinal, LVO)</small>';
            else if (st == '[[c![[c![[c![[c!!!![[c![[c![[c!!!!!')
               s += ' <small>(Second Large Veblen ordinal, SLVO)</small>';
            else if (st == '[[c![c!!')
               s += ' <small>(Bachmann-Howard ordinal, BHO)</small>';
            else if (st == '[[c[!!!')
               s += ' <small>(Buchholz ordinal, BO)</small>';
            else if (st == '[[c[!![c!!')
               s += ' <small>(Takeuti-Feferman-Buchholz ordinal, TFB)</small>';
            else if (st == '[[c[c!!!')
               s += ' <small>(Extended Buchholz ordinal, EBO)</small>';
            else if (st == '[[c[c!![c!!')
               s += ' <small>(Small Rathjen ordinal, SRO)</small>';
            else if (st == '[[c[c[c!!![c!!')
               s += ' <small>(Rathjen ordinal, RO)</small>';
         }
         spn = true;
         return s;
      }
      else {
         let beta = base(st);
         //return (beta?convert(beta):'')+'['+convert(booster(st),true)+']';
         return (beta ? convert0(beta, b) : '') + '[' + convert0(booster(st), b - 1) + ']';
      }
   }
   //return (format>1?st:JSON.stringify(cnf(st,format))).toString().replaceAll('!',']').replaceAll('"','');}

   // part of string to standard form
   function tostandard(st) {
      if (st >= col || st < leastepsilonbb)
         return st;
      let a = antibooster(st);
      let e = flooreps(a);
      return e + (a > e ? st : antibase(st));
   }

   // slice of string with p ≥ p1 and < p2
   function stringslice(st, p1, p2 = 'd') {
      let sop = stringtosop(st);
      let e = 0;
      while (sop[e] < p1 && e < sop.length)
         e++;
      let i = sop.length - 1;
      if (p2 != 'd')
         while (sop[i] >= p2 && i >= e)
            i--;
      return soptostring(sop.slice(e, i + 1));
   }

   function stringtosepsum(st) {
      return sepatosepsum(soptosepa(stringtosop(st)));
   }

   function convertat(p) {
      return sugar[31] ? convertpower('<span style="color: #8d008d; font-weight: bold;">@</span>', sugar[19] ? p : arraytoposition(p), false) : '<span style="color: #8d008d; font-weight: bold;">@</span> ' + arraytoposition(p);
   }

   function convertarray(p, neo) {
      if (!p)
         return convertzero();
      let r = stringslice(p, '', neo);
      let ar = r ? [['', r]] : [];
      let sepsum = stringtosepsum(stringslice(p, neo));
      for (let e = 0; e < sepsum.length; e++)
         ar.push(sepsum[e].slice(1));
      let s = '';

      if (sugar[29]) {
         let e = ar.length;
         while (e) {
            e--;
            s += convertsubstring(ar[e][1], -1, -1);
            let c = ar[e][0];
            let nc = e ? ar[e - 1][0] : '-';
            while (c.length > 1 && c.slice(-2) == '[!') {
               c = c.slice(0, -2);
               if (c == nc) {
                  s += ', ' + convertsubstring(ar[e - 1][1], -1, -1);
                  e--;
                  nc = e ? ar[e - 1][0] : '-';
               }
               else {
                  s += ', ' + convertzero();
               }
            }
            if (c || sugar[41])
               s += ' ' + convertat(convertarray(c, neo)) + ', ';
            else
               s += ', ';
         }
      }
      else {
         for (let e = ar.length - 1; e > 0; e--)
            s += convertsubstring(ar[e][1], -1, -1) + ' ' + convertat(convertarray(ar[e][0], neo)) + ', ';
         s += convertsubstring(ar[0][1], -1, -1) + (ar[0][0] || sugar[41] ? ' ' + convertat(convertarray(ar[0][0], neo)) : '') + ', ';
      }

      s = s.slice(0, -2);
      return s;
   }

   function convertveblen(st) {
      if (!sugar[24] && !sugar[25] && !sugar[26] && !sugar[27] && !sugar[28])
         return '';
      let neo = nexteps(st, 1);
      let x = booster(st);
      if (x < neo) {
         if (!sugar[28] || (!sugar[30] && sugar[41]))
            return '';
         return displayphi(convertarray(st, neo));
      }
      if (x >= nexteps(neo))
         return '';
      let p = stringslice(x, neo);
      let neo2 = bb(neo, neo);
      let neo3 = bb(neo2, neo);
      let neos = bb(neo, neo2);
      if (!sugar[28] || (!sugar[30] && sugar[41])) {
         if ((!sugar[24] || p != neo) && (!sugar[25] || p != neo2) && (!sugar[26] || p != neo3) && (!sugar[27] || p != neos))
            return '';
      }
      else {
         if (sugar[30]) {
            if (!sugar[32] && p >= bb(neo, neos))
               return '';
         }
         else {
            if (sugar[29]) {
               if (p >= bb(neo, bb(neo, bb(neo, ''))))
                  return '';
            }
            else {
               if ((!sugar[24] || p != neo) && (!sugar[25] || p != neo2) && (!sugar[26] || p != neo3) && (!sugar[27] || p != neos))
                  return '';
            }
         }
      }
      let sop = [stringslice(x, '', neo)];
      st = base(st);
      if (st)
         x = booster(st);
      while (st && stringslice(x, neo) == p) {
         sop.push(stringslice(x, '', neo));
         st = base(st);
         if (st)
            x = booster(st);
      }
      if (st) {
         let ca = checkpolynomial(st, p, neo);
         if (ca < 1)
            sop = sumsop(ca ? stringtosop(st) : [''], sop);
      }
      if (!sop[sop.length - 1])
         sop.pop();
      if (sugar[24] && p == neo)
         return convertsubscript('ε', convertsubstring(soptostring(sop), -1, -1));
      if (sugar[25] && p == neo2)
         return convertsubscript('ζ', convertsubstring(soptostring(sop), -1, -1));
      if (sugar[26] && p == neo3)
         return convertsubscript('η', convertsubstring(soptostring(sop), -1, -1));
      if (sugar[27] && p == neos)
         return convertsubscript('Γ', convertsubstring(soptostring(sop), -1, -1));
      sop = sumsop(stringtosop(p), sop);
      p = soptostring(sop);
      return displayphi(convertarray(p, neo));
   }

   // if b then st is not substring
   function convertepsilon(st, b = false) {
      if (st == col)
         return convertc();
      let e = propernamestring.indexOf(st);
      let t = '';
      if (e >= 0) {
         let s = sugar[22] && shortpropernames[e];
         if (b) {
            if (s || sugar[21])
               t += ' <small>(' + (sugar[21] ? propernames[e] : '') + (s && sugar[21] ? ', ' : '') + (s ? shortpropernames[e] : '') + ')</small>';
         }
         else if (s)
            return shortpropernames[e];
      }
      //if(sugar[34]&&st>=leastuncountable&&getepslevel(st)>0)
      if ((sugar[15] || sugar[33] || sugar[34]) && getepslevel(st) > 0)
         return convertepsilon0(st, format) + t;
      let cv = convertveblen(st);
      if (cv)
         return cv + t;
      //if(sugar[40]&&(getepslevel(st)==1||booster(st)<nextzeta(st,1)))
      //let g=getepslevel(st);
      //if(sugar[34]&&g==1)
      //if(sugar[40]&&g<2)
      //if(sugar[40]&&getepslevel(st)<2)
      if (sugar[40] && getepslevel(st) < 2 && booster(st) < nextzeta(st, 1))
         //let neo=nexteps(st,1);
         //neo=nexteps(neo,1);
         //if(sugar[40]&&getepslevel(st)<2&&booster(st)>=bb(neo,neo)&&antibooster(st.slice(flooreps(st,1).length))<nextzeta(st,1))
         //if(sugar[40]&&getepslevel(st)<2&&booster(st)>=neo&&antibooster(st.slice(flooreps(st,1).length))<nextzeta(st,1))
         return convertbuchholz(st) + t;
      //return convertepsilon0(st,format);
      return convertbaseandbooster(st) + t;
   }

   // is β[X] == ω^p
   function isomegap(st) {
      return st == '[!' || st == col || booster(st) > base(st);
   }

   // is β[X] == ε
   function isepsilon(st) {
      return st == col || booster(st) > st;
   }

   function sumsop(sop1, sop2) {
      if (!sop2.length)
         return sop1;
      if (!sop1.length)
         return sop2;
      let op = sop2[sop2.length - 1];
      let e = 0;
      while (sop1[e] < op)
         e++;
      return [...sop2, ...sop1.slice(e)]
   }

   function convertomega() {
      if (sugar[15])
         return '<span style="color: #ff0000; font-weight: bold;">ω</span>';
      if (sugar[34])
         return convertsubscript('<span style="color: #001aff; font-weight: bold;">Ω</span>', convertzero());
      if (sugar[33])
         return convertsubscript('ℵ', convertzero());
      if (sugar[28] && (sugar[30] || !sugar[41]))
         return displayphi(convertarray('[!', leastuncountable));
      if (sugar[40])
         return displaypsi(convertzero(), convertone());
      return '[' + convertone() + '!';
      //return '[[!!';
   }

   /*function convertfinite(st)
   {
   if(sugar[18])
      return st.length/2;
   return convertsubstring(st);
   }*/

   /*function convertproduct0(st,m)
   {
   if(m=='[!')
      return convertsubstring(st);
   st=st=='[[!!'?convertomega():convertsubstring(st);
   m=m<'[[!!'?convertfinite(m):convertsubstring(m);
   if(!sugar[17]||m[0]=='[')
      st+=multiplicationsign[sugar[16]];
   return st+m;
   }*/

   function sumtoterm(st) {
      st = String(st);
      let e = st.length;
      let np = 0;
      while ((e > -1) && (np != 0 || st[e] != '+')) {
         e--;
         if (st[e] == '[' || st[e] == '(' || st[e] == '{' || (e > 0 && st.slice(e - 1, e + 1) == '<s'))
            np--;
         else if (st[e] == '!' || st[e] == ')' || st[e] == '}' || (e > 0 && st.slice(e - 1, e + 1) == '</'))
            np++;
      }
      return e < 0 ? st : '<span style="color: #666666; font-weight: bold;">(</span>' + st + '<span style="color: #666666; font-weight: bold;">)</span>';
   }

   function arraytoposition(st) {
      st = String(st);
      let e = st.length;
      let np = 0;
      while ((e > -1) && (np != 0 || (st[e] != '@' && st[e] != ','))) {
         e--;
         if (st[e] == '[' || st[e] == '(' || st[e] == '{' || (e > 0 && st.slice(e - 1, e + 1) == '<s'))
            np--;
         else if (st[e] == '!' || st[e] == ')' || st[e] == '}' || (e > 0 && st.slice(e - 1, e + 1) == '</'))
            np++;
      }
      return e < 0 ? st : '{' + st + '}';
   }

   function powertofactor(st) {
      st = String(st);
      let e = st.length;
      let np = 0;
      while ((e > -1) && (np != 0 || (st[e] != '^' && st[e] != '_'))) {
         e--;
         if (st[e] == '[' || st[e] == '(' || st[e] == '{' || (e > 0 && st.slice(e - 1, e + 1) == '<s'))
            np--;
         else if (st[e] == '!' || st[e] == ')' || st[e] == '}' || (e > 0 && st.slice(e - 1, e + 1) == '</'))
            np++;
      }
      return e < 0 ? st : '<span style="color: #666666; font-weight: bold;">(</span>' + st + '<span style="color: #666666; font-weight: bold;">)</span>';
   }

   function convertproduct(st, m) {
      m = sumtoterm(m);
      /*if(!sugar[17]||m[0]=='[')
         st+=multiplicationsign[sugar[16]];
      return powertofactor(st)+m;*/
      return powertofactor(st) + (!sugar[17] || m[0] == '[' ? multiplicationsign[sugar[16]] : '') + m;
   }

   /*function convertpower0(st,p)
   {
   if(p=='[!')
      return convertsubstring(st);
   st=st=='[[!!'?convertomega():convertsubstring(st);
   if(sugar[19])
      return st+'<sup>'+convertsubstring(p)+'</sup>';
   return st+'^'+convertsubstring(p);
   }*/

   function convertpower(st, p, b = true) {
      if (b && !sugar[13])
         return 'Ε(' + st + ',' + p + ')';
      if (sugar[19])
         return (sugar[20] ? st : powertofactor(st)) + '<sup>' + p + '</sup>';
      return powertofactor(st) + '^' + sumtoterm(p);
   }

   function convertsubscript(st, p) {
      if (sugar[20])
         return st + '<sub>' + p + '</sub>';
      return powertofactor(st) + '_' + sumtoterm(p);
   }

   function displayfunction(f, sub, st, subexists = true) {
      return (subexists ? convertsubscript(f, sub) : f) + '<span style="color: #666666; font-weight: bold;">(</span>' + st + '<span style="color: #666666; font-weight: bold;">)</span>';
   }

   function displaypsi(sub, st, subexists = true) {
      return displayfunction('ψ', sub, st, subexists);
   }

   function displayphi(st) {
      return displayfunction('<span style="color: #888888; font-weight: bold;">φ</span>', '', st, false);
   }

   function getOmeganumber(st) {
      /*if(!st)
         return '';
      let l=getepslevel(st);
      if(l>1)
         return st;*/
      let f = nexteps(st, 2);
      if (booster(st) >= bb(f, f))
         return st;
      let sopc = [];
      while (st) {
         sopc.push(booster(st));
         st = base(st);
      }
      sopc = sopdividedbyepsilon(sopc, leastr);
      return soptostring(sopc);
   }

   function convertbuchholz(st) {
      let c = flooreps(st, 1);
      let sop = [];
      while (st != c) {
         sop.push(booster(st));
         st = base(st);
      }
      if (!c)
         return displaypsi(convertzero(), convertsubstring(soptostring(sop), -1, -1));
      if (c == col)
         return displaypsi(nlevels == 1 ? convertone() : convertc(), convertsubstring(soptostring(sop), -1, -1));
      let g = getOmeganumber(c);
      if (c == g)
         return displaypsi(convertepsilon0(c, format), convertsubstring(soptostring(sop), -1, -1));
      return displaypsi(convertsubstring(g, -1, -1), convertsubstring(soptostring(sop), -1, -1));
      /*let sopc=[];
      while(c)
         {
         sopc.push(booster(c));
         c=base(c);
         }
      sopc=sopdividedbyepsilon(sopc,leastr);
      return displaypsi(convertsubstring(soptostring(sopc),-1,-1),convertsubstring(soptostring(sop),-1,-1));*/
   }

   function convertone() {
      if (sugar[14])
         return '1';
      //if(sugar[13]&&sugar[15]&&sugar[23])
      if (sugar[15] && sugar[23])
         return convertpower(convertomega(), convertzero());
      if (sugar[28])
         return displayphi(convertarray('', leastuncountable));
      if (sugar[40])
         return displaypsi(convertzero(), convertzero());
      //if(sugar[13])
      //   return convertpower(convertomega(),convertzero());
      return '[' + convertzero() + '!';
      //return '[!';
   }

   function convertbaseandbooster(st) {
      return bb(convertsubstring(base(st), -1, -1, false), convertsubstring(booster(st), -1, -1));
   }

   //function convertop(st,b=true)
   function convertop(op) {
      if (!op)
         return convertone();
      if (op == '[!')
         return convertomega();
      //if(b&&isepsilon(st))
      //let e=flooreps(op);
      //if(sugar[40]&&booster(e)<nextzeta(e,1))
      //if(sugar[40]&&booster(op)<nextzeta(op,1))
      //if(sugar[34]&&getepslevel(op)==1)
      //   return convertepsilon0(op,format);
      //if(sugar[40])
      //   return convertbuchholz(op);
      if (isepsilon(op))
         return convertepsilon(op);
      if (sugar[10] && op >= leastepsilon)
         return convertepa(optoepa(op));
      //return convertpower('[[!!',op);
      //if(sugar[13]&&sugar[23])
      if (sugar[23])
         return convertpower(convertomega(), convertsubstring(op, -1, -1));
      if (sugar[28] && (sugar[30] || !sugar[41])) {
         let cv = convertveblen(op);
         if (cv)
            return cv;
      }
      if (sugar[40] && !((sugar[15] || sugar[33] || sugar[34]) && op >= leastuncountable))
         return convertbuchholz(op);
      //return bb('',convertsubstring(op,-1,-1));
      return convertbaseandbooster(tostandard(bb('', op)));
      //return sugar[13]?convertpower(convertomega(),convertsubstring(op,-1,-1)):bb('',convertsubstring(op,-1,-1));
   }

   /*function getop(st)
   {let l=getepslevel(st);
   if
   return booster(st);
   if(st<leastepsilon)
      return booster(st);
   let x=booster(st);
   let beta=base(st);
   return x>beta?x:bb(beta,booster(x));
   }*/

   /*function convertomegap(st,b)
   {
   if(isepsilon(st))
      return convertepsilon(st,b);
   //return convertop(booster(st),false);
   //if(base(st)!=flooreps(booster(st)))
   //   alert(st);
   return convertop(booster(st));
   //return convertop(getop(st));
   }*/

   function optostring(st) {
      return isepsilon(st) ? st : bb(flooreps(st), st);
   }

   function stringtosop(s) {
      let st = s;
      if (!st)
         return [];
      let sop = [];
      //let st1=st;
      if (isomegap(st)) {
         sop.push(isepsilon(st) ? st : booster(st));
         return sop;
      }
      do {
         sop.push(booster(st));
         st = base(st);
      }
      while (!isomegap(st));
      //while(st&&!isomegap(st));
      sop.push(isepsilon(st) ? st : booster(st));
      //if(st1!=soptostring(sop))
      //   alert(st1+'\n'+soptostring(sop));
      return sop;
   }

   function soptostring(sop) {
      let e = sop.length - 1;
      if (e < 0)
         return '';
      let op = sop[e];
      let st = isepsilon(op) ? op : bb(flooreps(op), op);
      e--;
      while (e >= 0) {
         st += bb('', sop[e]);
         e--;
      }
      return st;
   }

   function soptosopn(sop) {
      let sopn = [];
      let op = sop[0];
      let n = 1;
      for (let e = 1; e < sop.length; e++)
         if (sop[e] == op)
            n++;
         else {
            //sopn.push([op,n]);
            //sopn.push(op?[op,n]:n);
            sopn.push(op ? n > 1 ? [op, n] : op : n);
            op = sop[e];
            n = 1;
         }
      //sopn.push([op,n]);
      //sopn.push(op?[op,n]:n);
      sopn.push(op ? n > 1 ? [op, n] : op : n);
      return sopn;
   }

   /*function optoepa0(op)
   {
   if(op<leastepsilon)
      return op;
   let e=flooreps(op);
   if(op==e)
      return [e,'[!',''];
   let s=op;
   let s1='';
   let m;
   while(booster(s)<e)
      {
      s1=s;
      s=base(s);
      }
   let bs=booster(s1);
   /*if(isepsilon(bs))
      m=bs+op.slice(s1.length);
   else
      m=op.slice(s.length);*/

   /* if(isepsilon(bs))
      m=bs+op.slice(s1.length);
   else
      m=flooreps(bs)+op.slice(s.length);
      
   let p='';
   let l=e.length;
   let e2=bb(e,e);
   let l2=e2.length;
   let es=bb(e,e2);
   let eo=bb(e,bb(e,''));
   let i=s<es?0:s<bb(e,bb(e2,''))?1:2;
   let q=i==1?es:e;
   let e1='';
   while(s!=q)
      {
      let t=booster(s)
      if(t<e2)
         t=t.slice(l);
      else if(t<eo)
         t=e+t.slice(l2);
      s=base(s);
   
   
      /*if(!i&&s==q&&!base(t))
         {
         let w=booster(t);
         if(isepsilon(w))
            p=w+p;
         else
            p=bb('',t)+p;
         }
      else
         p=bb('',t)+p;*/

   /*let f='';
   while(base(t))
      {
      f=bb('',booster(t))+f;
      t=base(t);
      }
   t=booster(t);
   let b=isepsilon(t);
   t=(b?t:bb('',t))+f;*/

   /*if(b&&!f&&!i&&s==q)
      p=t+p;
   else
      p=bb('',t)+p;*/


   //if(!i&&t>=leastepsilonbb)
   /*   if(t>=leastepsilonbb)
         {
         let ax=antibooster(t);
         let ab=antibase(t);
         e1=flooreps(ax);
         if(ax==e1&&s==q)
            t=ax+ab;
         else
            t=e1+t;
         if(s!=q||t!=e1)
            p=bb('',t)+p;
         }
      else
         p=bb('',t)+p;
   
      /*if(!i&&!base(t))
         {
         let w=booster(t);
         if(isepsilon(w))
            p=(s==q?w:t)+p;
         else
            p=bb('',t)+p;
         }
      else
         p=bb('',t)+p;*/

   /*   }
   if(i)
      p=e+p;
   else 
      {
      p=e1+p;
      if(p<'[[!!')
         p+='[!';
      }
   return [e,p,m];
   }*/

   function sopslice(sop, op) {
      let e = 0;
      while (sop[e] < op && e < sop.length)
         e++;
      return [sop.slice(0, e), sop.slice(e)];
   }

   function opdividedbyepsilon(op, e) {
      op = op.slice(e.length);
      if (op < leastepsilonbb)
         return op;
      let ax = antibooster(op);
      let e1 = flooreps(ax);
      if (ax == e1)
         return ax + antibase(op);
      return e1 + op;

      /*if(op==e)
         return '';
      let e2=bb(e,e);
      if(op<e2)
         return bb('',op.slice(e.length+1,-1));
      if(op==e2)
         return e;
      if(op<bb(e,bb(e,'')))
         return bb('',e+op.slice(e2.length+1,-1));
      return op;*/
   }

   function sopdividedbyepsilon(sop, e) {
      return sop.map(op => opdividedbyepsilon(op, e))
   }

   function optoepa(op) {
      if (op < leastepsilon)
         return op;
      let e = flooreps(op);
      if (op == e)
         return [e, '[!', ''];
      //let sop=stringtosop(booster(op));
      let sop = stringtosop(op);
      let m, p;
      [m, p] = sopslice(sop, e);
      m = soptostring(m);
      //p=p.map(i=>opdividedbyepsilon(i,e));
      p = sopdividedbyepsilon(p, e);
      p = soptostring(p);
      return [e, p, m];
   }

   /*function opntoepan(opn)
   {
   let epa=optoepa(opn[0]);
   if(!Array.isArray(epa))
      return opn;
   return optoepa(opn[0]).push(opn[1]);
   }*/

   function soptosepa(sop) {
      return sop.map(optoepa);
   }

   /*function sopntosepan(sopn)
   {
   return sopn.map(opntoepan);
   }*/

   function sepatosepsum(sepa) {
      let sepsum = [];
      let i = 0;
      while (i < sepa.length && !Array.isArray(sepa[i]))
         i++;
      if (i) {
         sepsum = sugar[9] ? soptosopn(sepa.slice(0, i)) : sepa.slice(0, i);
         sepa = sepa.slice(i);
      }
      if (sepa.length) {
         let j = 0;
         let e = sepa[0][0];
         let p = sepa[0][1];
         let z = sepa[0][2];
         let a = '';
         /*let z1='';
         while(z)
            {
            z1=z;
            z=base(z);
            }
         let bs=z1;
         let em;
         if(isepsilon(bs))
            {
            a=bb('',bs)+sepa[0][2].slice(z1.length);
            em=bs;
            }
         else
            {
            a=sepa[0][2].slice(z.length);
            em=booster(bs);
            }*/

         for (let i = 1; i < sepa.length; i++) {
            if (sepa[i][0] == e && sepa[i][1] == p) {
               if (i > j)
                  a = bb('', z) + a;
               z = sepa[i][2];
               /*while(z&&booster(z)<em)
                  z=base(z);
               if(isepsilon(z)&&z<em)
                  z='';
               z1='';
               while(z)
                  {
                  z1=z;
                  z=base(z);
                  }
               bs=z1;
               if(isepsilon(bs))
                  {
                  a=bb('',bs)+sepa[i][2].slice(z1.length)+a;
                  em=bs;
                  }
               else
                  {
                  a=sepa[i][2].slice(z.length)+a;
                  em=booster(bs);
                  }*/
            }
            else {
               a = (isepsilon(z) ? z : flooreps(z) + bb('', z)) + a;
               sepsum.push([e, p, a]);
               j = i;
               e = sepa[i][0];
               p = sepa[i][1];
               z = sepa[i][2];
               a = '';
               /*z1='';
               while(z)
                  {
                  z1=z;
                  z=base(z);
                  }
               bs=z1;
               if(isepsilon(bs))
                  {
                  a=bb('',bs)+sepa[i][2].slice(z1.length);
                  em=bs;
                  }
               else
                  {
                  a=sepa[i][2].slice(z.length);
                  em=booster(bs);
                  }*/
            }
         }
         a = (isepsilon(z) ? z : flooreps(z) + bb('', z)) + a;
         sepsum.push([e, p, a]);
      }
      return sepsum;
   }

   function convertsepa(sepa) {
      return sepa.map(convertepa);
   }

   /*function convertsepan(sepan)
   {
   return sepan.map(convertepan);
   }*/

   function convertsepsum(sepsum) {
      return sepsum.map(convertepsum);
   }

   function convertnatural(n) {
      //if(!n)
      //   return convertzero();
      if (n == 1)
         return convertone();
      if (sugar[18])
         return n;
      let s9 = sugar[9];
      let s10 = sugar[10];
      sugar[9] = 0;
      sugar[10] = 0;
      let st = convertsubstring('[!'.repeat(n), -1, -1);
      sugar[9] = s9;
      sugar[10] = s10;
      return st;
   }

   function convertopn(opn) {
      if (!Array.isArray(opn))
         return isNaN(opn) ? convertop(opn) : convertnatural(opn);
      if (sugar[13]) {
         if (opn[1] == 1)
            return convertop(opn[0]);
         if (!opn[0])
            return convertnatural(opn[1]);
         return convertproduct(convertop(opn[0]), convertnatural(opn[1]));
      }
      opn[0] = convertop(opn[0]);
      let s = 'Π';
      if (opn[0][0] == 'Ε') {
         opn[0] = opn[0].slice(2, -1);
         s = 'Ε';
      }
      opn[1] = convertnatural(opn[1]);
      //return JSON.stringify(opn).replaceAll('"','');
      //return 'Π('+JSON.stringify(opn).replaceAll('"','').slice(1,-1)+')';
      return s + '<span style="color: #666666; font-weight: bold;">(</span>' + opn[0] + ',' + opn[1] + '<span style="color: #666666; font-weight: bold;">)</span>';
   }

   function convertepa(epa) {
      if (!Array.isArray(epa))
         return convertop(epa);
      if (sugar[13]) {
         let a = epa[1] == '[!' ? convertepsilon(epa[0]) : convertpower(convertepsilon(epa[0]), convertsubstring(epa[1], -1, -1));
         return epa[2] ? convertproduct(a, convertop(epa[2])) : a;
      }
      if (epa[1] == '[!') {
         if (!epa[2])
            return convertepsilon(epa[0]);
         return 'Π(' + convertepsilon(epa[0]) + ',' + convertop(epa[2]) + ')';
      }
      if (!epa[2])
         return 'Ε(' + convertepsilon(epa[0]) + ',' + convertsubstring(epa[1], -1, -1) + ')';
      epa[0] = convertepsilon(epa[0]);
      epa[1] = convertsubstring(epa[1], -1, -1);
      epa[2] = convertop(epa[2]);
      //return JSON.stringify(epa).replaceAll('"','');
      //return 'Π('+JSON.stringify(epa).replaceAll('"','').slice(1,-1)+')';
      //return 'Π(Ε('+epa[0]+','+epa[1]+')'+','+epa[2]+')';
      //return 'Ε('+JSON.stringify(epa).replaceAll('"','').slice(1,-1)+')';
      return 'Ε(' + epa[0] + ',' + epa[1] + ',' + epa[2] + ')';
   }

   /*function convertepan(epan)
   {
   if(epan.length==2)
      return convertopn(epan);
   if(sugar[13])
      {
      let st=convertepa(epa.slice(0,2));
      if(epan[3]==1)
         return st;
      return convertproduct(st,convertnatural(opn[1]));
      }
   epan[0]=convertepsilon(epan[0]);
   epan[1]=convertsubstring(epan[1]);
   epan[2]=convertop(epan[2]);
   epan[3]=convertnatural(epan[3]);
   return JSON.stringify(opn).replaceAll('"','');
   }*/

   function convertepsum(epsum) {
      if (!Array.isArray(epsum))
         return !epsum || isNaN(epsum) ? convertop(epsum) : convertnatural(epsum);
      if (epsum.length == 2)
         return convertopn(epsum);
      if (sugar[13]) {
         let a = epsum[1] == '[!' ? convertepsilon(epsum[0]) : convertpower(convertepsilon(epsum[0]), convertsubstring(epsum[1], -1, -1));
         return epsum[2] == '[!' ? a : convertproduct(a, convertsubstring(epsum[2], -1, -1));
      }
      if (epsum[1] == '[!') {
         if (epsum[2] == '[!')
            return convertepsilon(epsum[0]);
         return 'Π(' + convertepsilon(epsum[0]) + ',' + convertsubstring(epsum[2], -1, -1) + ')';
      }
      if (epsum[2] == '[!')
         return 'Ε(' + convertepsilon(epsum[0]) + ',' + convertsubstring(epsum[1], -1, -1) + ')';
      epsum[0] = convertepsilon(epsum[0]);
      epsum[1] = convertsubstring(epsum[1], -1, -1);
      epsum[2] = convertsubstring(epsum[2], -1, -1);
      //return JSON.stringify(epsum).replaceAll('"','');
      //return 'Π('+JSON.stringify(epsum).replaceAll('"','').slice(1,-1)+')';
      //return 'Π(Ε('+epsum[0]+','+epsum[1]+')'+','+epsum[2]+')';
      //return 'Ε('+JSON.stringify(epsum).replaceAll('"','').slice(1,-1)+')';
      return 'Ε(' + epsum[0] + ',' + epsum[1] + ',' + epsum[2] + ')';
   }

   function convertsop(sop) {
      return sop.map(convertop);
   }

   function convertsopn(sopn) {
      return sopn.map(convertopn);
   }

   function convertsum(sum) {
      if (sum.length == 1)
         return sum[0];
      if (sugar[12]) {
         let s = '';
         for (let e = sum.length - 1; e >= 0; e--)
            s += sum[e] + ' + ';
         return s.slice(0, -3);
      }
      //return 'Σ'+JSON.stringify(sum).replaceAll('"','');
      return 'Σ(' + JSON.stringify(sum).replaceAll('"', '').slice(1, -1) + ')';
   }

   function convertbb(st, b) {
      //if(isomegap(st))
      //   return convertomegap(st,b);

      /*if(fsaltcheck)
         {
         fsaltcheck=false;
         st=fsalt(st,'',0);
         }*/

      if (isomegap(st))
         if (isepsilon(st))
            return convertepsilon(st, b);
         else
            return convertop(booster(st));
      if (sugar[8]) {
         let sop = stringtosop(st);
         //if(sugar[9]&&!(sugar[10]&&sugar[11]&&!sugar[40]))
         if (sugar[9] && !(sugar[10] && sugar[11])) {
            let sopn = soptosopn(sop);
            /*if(sugar[10])
               {
               let sepan=sopntosepan(sopn);
               return convertsum(convertsepan(sepan));
               }*/
            return convertsum(convertsopn(sopn));
         }
         if (sugar[10]) {
            let sepa = soptosepa(sop);
            //if(sugar[11]&&!sugar[40])
            if (sugar[11]) {
               let sepsum = sepatosepsum(sepa);
               return convertsum(convertsepsum(sepsum));
            }
            return convertsum(convertsepa(sepa));
         }
         return convertsum(convertsop(sop));
      }
      //return st;
      return convertbaseandbooster(st);
      //return convert0(st,0);
   }

   function convertzero(c = true) {
      if (sugar[2] && c)
         return '0';
      return '';
   }

   function convertc() {
      return col;
   }

   function convertsubstring(st, a = sugar[4], b = sugar[6], c = true) {
      if (!st)
         return convertzero(c);
      if (st == col)
         return convertc();
      if ((!sugar[5] && a <= 0) || (!sugar[7] && b <= 0))
         return convertbb(st, a == sugar[4] && b == sugar[6]);
      else
         return bb(convertsubstring(base(st), a, b - 1, false), convertsubstring(booster(st), a - 1, b));
   }

   function convertbo(st) {
      return st;
   }

   function convert(st) {
      //fsaltcheck=true;
      if (sugar[0])
         if (st == bo)
            st = convertbo(st);
         else
            st = convertsubstring(st);
      if (sugar[1])
         st = st.toString().replaceAll('!', ']');
      return st;
   }

   /*function rx(s,c,n,q){
   count++;
   let x=document.createElement('li');
   x.id=s;
   x.innerHTML=convert(s);
   if(s==''||s.slice(-2)=='[!')
      x.style.cursor='default';
   x=x.outerHTML;
   if(q>0){
      let y=document.createElement(ulnar[indentvisible]);
      s=fs(c,'',n);
      n++;
      y.innerHTML=rx(s,c,n,q-1);
      x+=y.outerHTML;} 
   return x;     
   }
   
   // small expansion of pair c > l
   function se(c,l,q){
   let n=0;
   let s;
   do{
      s=fs(c,'',n);
      n++;}
   //while(l!='-'&&compare(s,l,true)<1)
   while(l!='-'&&compare(s,l)<1)
   return q==-1?s:rx(s,c,n,q);  	
   }*/

   function pl(c) {
      let e = 0;
      let l = c.previousSibling;
      /*if(l==null){
         e++;
         l=c.parentNode.previousSibling;}*/

      while (l == null) {
         e++;
         c = c.parentNode;
         l = c.previousSibling;
      }

      while (l && l.tagName != 'LI') {
         e--;
         l = l.lastChild;
      }
      return [l, e];
   }

   function nl(c) {
      let l = c.nextSibling;

      while (l == null) {
         c = c.parentNode;
         l = c.nextSibling;
      }

      while (l && l.tagName != 'LI')
         l = l.firstChild;
      return l;
   }

   function cl(c) {
      while (c.lastChild.tagName == ulnar[indentvisible])
         c = c.lastChild;
      return c;
   }

   // small expansion of c
   function smallexp(c, n = 0) {
      if (c.id == '')
         return 0;
      let l = pl(c)[0];
      if (c.id.slice(-2) == '[!' && l.id == c.id.slice(0, -2))
         return 0;

      count++;
      let s;
      if (c.id == prevsmallexp) {
         s = fs(c.id, '', nextsmallexpn);
         nextsmallexpn++;
         n = nextsmallexpn;
      }
      else {
         do {
            s = fs(c.id, '', n);
            n++;
            if (n > 10 && s.length > 3 * l.id.length + 10)
               alert('fs < previous string\n\n' + l.id + '\n' + convert(l.id) + '\n\n' + c.id + '\n' + convert(c.id));
         }
         while (l.id != '-' && compare(s, l.id) < 1);
         prevsmallexp = c.id;
         nextsmallexpn = n;
      }
      let x = document.createElement('li');
      x.id = s;
      x.innerHTML = convert(s);
      if (s == '' || (s.slice(-2) == '[!' && l.id == s.slice(0, -2)))
         x.style.cursor = 'default';
      if (indentmode)
         if (c.previousSibling && c.previousSibling.tagName == ulnar[indentvisible])
            l.insertAdjacentHTML('afterend', x.outerHTML);
         else {
            let y = document.createElement(ulnar[indentvisible]);
            y.innerHTML = x.outerHTML;
            c.insertAdjacentHTML('beforebegin', y.outerHTML);
         }
      else
         if (c.previousSibling == null)
            c.insertAdjacentHTML('beforebegin', x.outerHTML);
         else {
            let y = document.createElement(ulnar[indentvisible]);
            y.innerHTML = x.outerHTML;
            l.insertAdjacentHTML('afterend', y.outerHTML);
         }
      return n;
   }

   function smallexpefs(c, extra) {
      if (c.id == '')
         return 0;
      let e = 0;
      let n = 0;
      do {
         n = smallexp(c, n);
         e++;
      }
      while (n && e <= extra);
   }

   function smallexpefslong(c, l, extra) {
      let q;
      do {
         q = pl(c)[0];
         smallexpefs(c, extra);
         c = q;
      }
      while (c != l);
   }

   function singleexp(c, extra) {
      let n;
      let l = pl(c)[0];
      let q = c;
      do {

         n = smallexp(q, 0);
         if (n)
            q = pl(q)[0];
      }
      while (n);
      if (extra)
         smallexpefslong(c, l, extra - 1);
   }

   function singleexplong(c, l, extra) {
      let q;
      do {
         q = pl(c)[0];
         singleexp(c, extra);
         c = q;
      }
      while (c != l);
   }

   function multipleexp(c, extra, n) {
      /*if(n==1)
         singleexp(c,extra);
      else*/
      {
         if (!nextl)
            nextl = pl(c)[0];
         do {
            n--;
            singleexplong(c, nextl, n ? 0 : extra);
         }
         while (n);
      }
   }

   function countli(c) {
      if (c.tagName == 'LI')
         return 1;
      let n = 0;
      for (let l = c.firstChild; l != null; l = l.nextSibling)
         if (l.tagName == ulnar[indentvisible])
            n += countli(l);
         else
            n++;
      return n;
   }

   function expcolmarksupdate() {
      let r = markedli.getBoundingClientRect();
      let h = r.left - 27 + listc.scrollLeft;
      let vc = listc.scrollTop + (r.top + r.bottom) / 2;
      //let vc=listc.clientHeight-listc.scrollTop-(r.top+r.bottom)/2;
      let s = markedli.previousSibling;
      let a = 0;
      let t = !markedli.id.length ? false : markedli.id.length < 2 || markedli.id.slice(-2, -1) != '[' || pl(markedli)[0].id != markedli.id.slice(0, -2);
      if (s && s.id != '-' && (!indentmode || s.tagName == ulnar[indentvisible])) {
         colmark.style.left = h - a + 'px';
         colmark.style.top = vc - 11 + 'px';
         colmark.hidden = false;
         a += 24;
      }
      else
         colmark.hidden = true;
      if (markedli.id && t) {
         smexmark.style.left = h - a + 'px';
         smexmark.style.top = vc - 11 + 'px';
         smexmark.hidden = false;
         a += 24;
         expmark.style.left = h - a + 'px';
         expmark.style.top = vc - 11 + 'px';
         expmark.hidden = false;
         a += 24;
      }
      else {
         smexmark.hidden = true;
         expmark.hidden = true;
      }
      if (mulcounter > 1 && t) {
         mulmark.style.left = h - a + 'px';
         mulmark.style.top = vc - 11 + 'px';
         mulmark.hidden = false;
         a += 24;
      }
      else
         mulmark.hidden = true;
   }

   function setmarkedli(c, b = true) {
      if (markedli)
         markedli.style.outline = '';
      markedli = c;
      markedli.style.outline = '1px solid gainsboro';
      if (b) {
         nextl = '';
         mulcounter = 1;
      }
      expcolmarksupdate();
   }

   function removebackground(c) {
      if (c == markedli)
         c.style.background = '';
      else
         c.removeAttribute('style');
   }

   function formatting(c = list) {
      let l = lea ? lea : markedli;
      let r = l.getBoundingClientRect();
      let vc = (r.top + r.bottom) / 2;

      for (let l = c.firstChild; l != null; l = l.nextSibling)
         if (l.tagName == ulnar[indentvisible])
            formatting(l);
         else if (l.id != '-')
            l.innerHTML = convert(l.id);
      expcolmarksupdate();
      far[format].style.background = '#d0ffd0';

      r = l.getBoundingClientRect();
      listc.scrollTop += (r.top + r.bottom) / 2 - vc;
      scrollli(l);
   }

   function updateli(c) {
      if (c)
         if (c.id)
            c = document.getElementById(c.id);
         else {
            c = nl(document.getElementById('-'));
            while (c.tagName == ulnar[indentvisible])
               c = c.FirstChild;
         }
      return c;
   }

   function psb(b = false) {
      if (b)
         ps.forEach(function (i) {
            //if(i.id!=''||i.tagName==ulnar[indentvisible])
            //if(i.tagName==ulnar[indentvisible])
            removebackground(i);
         });
      else
         ps.forEach(function (i) {
            //if(i.id!=''||i.tagName==ulnar[indentvisible])
            //if(i.tagName==ulnar[indentvisible])
            i.style.background = eo > 1 ? '#f8f8ff' : '#fffff0';
         });
   }

   function mousetextupdate(x, y) {
      //xs.style.left=x+(x*2<window.innerWidth?35:-xs.offsetWidth-15)+'px';
      xs.style.left = x + (x * 2 < window.innerWidth || 25 * Math.round(x / 25) + 15 + xs.offsetWidth < window.innerWidth ? 35 : -xs.offsetWidth - 15) + 'px';
      //xs.style.top=y-(y*2<window.innerHeight?(vero?-18:5):xs.offsetHeight-(vero+30))+'px';
      xs.style.top = y - (y * 2 < window.innerHeight || 25 * Math.round(y / 25) - 50 + xs.offsetHeight < window.innerHeight ? (vero ? -18 : 5) : xs.offsetHeight - (vero + 30)) + 'px';
   }

   function mouseoverupdate(c = '') {
      if (mousex) {
         if (!c)
            c = document.elementFromPoint(mousex, mousey);
         let u = new Event('mouseover');
         Object.defineProperty(u, 'target', { value: c });
         document.dispatchEvent(u);
      }
   }

   function setps(c, n = '') {
      //n--;
      let q = c.previousSibling;
      //if(!b)
      //   c=c.lastChild;
      //exb[0]=q!=null&&q.id!='-';
      exb[0] = q && (indentmode ? q.tagName == ulnar[indentvisible] : q.id != '-');
      exb[1] = c.id != '' && (c.id.slice(-2) != '[!' || pl(c)[0].id != c.id.slice(0, -2));
      //if(b)
      ps = [];
      //else
      //	ps.push(c);

      if (exb[0])
         if (n) {
            q = pl(c)[0];
            pairl[0] = n;
            do {
               ps.push(q);
               q = pl(q)[0];
            }
            while (q != pairl[0] && q.offsetTop + q.offsetHeight > listc.scrollTop - 10);
         }
         else if (indentmode)
      /*{q=q.lastChild;
      ps.push(q);
      while(q.previousSibling&&q.previousSibling.tagName==ulnar[indentvisible])
         {q=q.previousSibling.lastChild;
         ps.push(q);}
      pairl[0]=pl(q)[0];}*/ {
            q = q.lastChild;
            pairl[0] = q.previousSibling;
            if (!pairl[0])
               pairl[0] = pl(q)[0];
            else if (pairl[0].tagName == ulnar[indentvisible])
               pairl[0] = pl(pairl[0])[0];
            do {
               ps.push(q);
               q = pl(q)[0];
            }
            //while(q!=pairl[0]&&q.offsetTop+q.offsetHeight>listc.scrollTop-10);
            while (q != pairl[0]);
         }
         else {
            let cc = q;
            if (q.tagName == ulnar[indentvisible]) {
               cc = cl(cc);
               pairl[0] = cc.previousSibling;
               cc = cc.lastChild;
            }
            else
               pairl[0] = q.parentNode.previousSibling;
            //while(cc&&cc.offsetTop+cc.offsetHeight>listc.scrollTop-10)
            while (cc) {
               ps.push(cc);
               cc = cc.previousSibling;
            }
         }
      else {
         pairb[0] = false;
         pairl[0] = document.getElementById('-');
      }

      if (exb[1]) {
         pairl[1] = pl(c)[0];
         pairb[1] = pairl[1].id != '-';
      } else {
         pairb[1] = false;
         pairl[1] = document.getElementById('-');
      }

      //if(n&&pairl[0].id!='-')
      //   setps(pairl[0].parentNode,n,false);
   }

   function expwords(n) {
      /*let ord='th';
      if (n %10 == 1 && n % 100 != 11)
         ord = 'st';
      else if (n % 10 == 2 && n % 100 != 12)
         ord = 'nd';
      else if (n % 10 == 3 && n % 100 != 13)
         ord = 'rd';*/

      //return n<10?exp[n]:n+'-fold recursive expansion';
      //return n<10?exp[n]:'Recursively expand '+n+ord+' times';
      return n < 10 ? exp[n] : 'Recursively expand';
   }

   function scrollli(c) {
      if (c) {
         let lx = listc.scrollLeft;
         let ly = listc.scrollTop;
         $(c).wrapInner('<ul1 style="padding-right: 27px">');
         let u = c.firstChild;
         let r = u.getBoundingClientRect();
         let rc = c.getBoundingClientRect();
         let r1 = listc.getBoundingClientRect();
         let bx = r.left < r1.left ? -1 : r.right > r1.right ? 1 : 0;
         let by = rc.top < r1.top + 3 ? -1 : rc.bottom > r1.bottom - 3 ? 1 : 0;
         if (by < 0)
            if (c.id == '')
               listc.scrollTop = -listc.scrollHeight;
            else {
               u.scrollIntoView({ inline: 'end' });
               listc.scrollTop -= 3 + r.top - rc.top;
            }
         else
            if (by > 0) {
               listc.style.overflowX = 'auto';
               if (c.id == initlargeordinal)
                  listc.scrollTop = 0;
               else {
                  u.scrollIntoView({ block: 'end', inline: 'end' });
                  listc.scrollTop += 3 - r.bottom + rc.bottom;
               }
               listc.style.overflowX = 'overlay';
            }
            else
               u.scrollIntoView({ inline: 'end' });
         if (!bx)
            listc.scrollLeft = lx;
         if (!by)
            listc.scrollTop = ly;
         u.removeAttribute('style');
         $(u).contents().unwrap();
      }
   }

   function seteo(i) {
      eo = i;
   }

   function doexpcol(c) {
      let eo1 = eo;
      seteo(c == 'Space' ? 0 : c == 'Backspace' ? -1 : 1);
      let m = markedli.id;
      if (c == 'KeyC') {
         nextlb = true;
         if (m.length < 4 || m.slice(-4) != '[[!!')
            mulcounter++;
      }
      else {
         multicount = 1;
         if (c == 'Enter') {
            nextlb = true;
            nextl = '';
            if (m.length < 4 || m.slice(-4) != '[[!!')
               mulcounter = 2;
         }
      }
      mouseoverupdate(markedli);
      markedli.click();
      if (c == 'KeyC' || c == 'Enter')
         multicount += countdifference;
      //scrolly(markedli);
      scrollli(markedli);
      seteo(eo1);
      mousetag = ''; mousetagp = xs;
      mouseoverupdate();
      nextlb = false;
      expcolmarksupdate();
   }

   function sugarbuttonupdate() {
      let c, ca, cb;
      for (let e = 0; e < sugarbuttonnumber.length; e++)
         if (sugarbuttonnumber[e])
            if (sugarbuttonnumber[e] == 1) {
               c = document.getElementById('sugarbutton' + e);
               c.style.background = sugar[e] ? sugarbuttoncolor[e] : '#fff';
            }
            else {
               ca = document.getElementById('sugarbuttona' + e);
               cb = document.getElementById('sugarbuttonb' + e);
               ca.style.background = sugar[e] ? '#fff' : sugarbuttoncolor[e];
               cb.style.background = sugar[e] ? sugarbuttoncolor[e] : '#fff';
            }
      sugarbutton2.hidden = !sugar[0];
      //sugarbutton3.hidden=!sugar[0];
      decdec.hidden = !sugar[0];
      decintoboostersl.hidden = !sugar[0];
      incdec.hidden = !sugar[0];
      infdec.hidden = !sugar[0];
      decdecbase.hidden = !sugar[0];
      decintobasesl.hidden = !sugar[0];
      incdecbase.hidden = !sugar[0];
      infdecbase.hidden = !sugar[0];
      sugarbutton8.hidden = !sugar[0];;
      sugarbutton9.hidden = !sugar[0] || !sugar[8];
      sugarbutton10.hidden = !sugar[0];
      sugarbutton11.hidden = !sugar[0] || !sugar[8] || !sugar[10];
      sugarbutton12.hidden = !sugar[0] || !sugar[8];
      sugarbutton13.hidden = !sugar[0];
      sugarbutton14.hidden = !sugar[0];
      sugarbutton15.hidden = !sugar[0];
      sugarbuttona16.hidden = !sugar[0] || (!sugar[9] && !sugar[10]) || !sugar[13];
      sugarbuttonb16.hidden = !sugar[0] || (!sugar[9] && !sugar[10]) || !sugar[13];
      sugarbutton17.hidden = !sugar[0] || (!sugar[9] && !sugar[10] || !sugar[13]);
      sugarbutton18.hidden = !sugar[0] || !sugar[8] || !sugar[9];
      /*sugarbuttona19.hidden=!sugar[0]||!sugar[13];
      sugarbuttonb19.hidden=!sugar[0]||!sugar[13];*/
      sugarbuttona19.hidden = !sugar[0];
      sugarbuttonb19.hidden = !sugar[0];
      sugarbuttona20.hidden = !sugar[0] || (!sugar[24] && !sugar[25] && !sugar[26] && !sugar[27]);
      sugarbuttonb20.hidden = !sugar[0] || (!sugar[24] && !sugar[25] && !sugar[26] && !sugar[27]);
      sugarbutton21.hidden = !sugar[0];
      sugarbutton22.hidden = !sugar[0];
      //sugarbutton23.hidden=!sugar[0]||!sugar[13];
      sugarbutton23.hidden = !sugar[0];
      sugarbutton24.hidden = !sugar[0];
      sugarbutton25.hidden = !sugar[0];
      sugarbutton26.hidden = !sugar[0];
      sugarbutton27.hidden = !sugar[0];
      sugarbutton28.hidden = !sugar[0];
      sugarbutton29.hidden = !sugar[0];
      sugarbutton30.hidden = !sugar[0] || !sugar[28];
      sugarbuttona31.hidden = !sugar[0] || !sugar[28] || !sugar[30];
      sugarbuttonb31.hidden = !sugar[0] || !sugar[28] || !sugar[30];
      sugarbutton41.hidden = !sugar[0] || !sugar[28] || !sugar[30];
      sugarbutton32.hidden = !sugar[0] || !sugar[28] || !sugar[30];
      sugarbutton33.hidden = !sugar[0];
      sugarbutton34.hidden = !sugar[0];
      sugarbutton40.hidden = !sugar[0];
   }

   function sugarbuttonclick(e) {
      sugar[e] = 1 - sugar[e];
      sugarbuttonupdate();
      formatting();
   }

   function sugarbuttonswitch(e, n) {
      if (sugar[e] != n) {
         sugar[e] = 1 - sugar[e];
         sugarbuttonupdate();
         formatting();
      }
   }

   function defaultsugar(i = 1) {
      sugar = [...sugardefault[i]];
      sugarbuttonupdate();
      formatting();
      decboostersupdate();
      decbasesupdate();
   }

   function decboostersupdate() {
      let b = sugar[5] || sugar[4];
      decintoboostersl.innerHTML = 'decomposition<br/>into boosters: ' + (sugar[5] ? '∞' : sugar[4]);
      decdec.style.opacity = b ? 1 : 0.4;
      decdec.style.cursor = b ? 'pointer' : 'default';
      if (document.getElementById('decdec1') != null) {
         xs.style.background = b ? '#fffff0' : '#fff';
         decdec1.style['font-style'] = b ? 'normal' : 'italic';
         decdec2.style['font-weight'] = b ? 'bold' : 'normal';
      }
   }

   function decbasesupdate() {
      let b = sugar[7] || sugar[6];
      decintobasesl.innerHTML = 'decomposition<br/>into bases: ' + (sugar[7] ? '∞' : sugar[6]);
      decdecbase.style.opacity = b ? 1 : 0.4;
      decdecbase.style.cursor = b ? 'pointer' : 'default';
      if (document.getElementById('decdecbase1') != null) {
         xs.style.background = b ? '#fffff0' : '#fff';
         decdecbase1.style['font-style'] = b ? 'normal' : 'italic';
         decdecbase2.style['font-weight'] = b ? 'bold' : 'normal';
      }
   }

   function resetlist(m = uncountablemode) {
      ps = [];
      nextl = '';
      mulcounter = 1;
      multicount = 1;
      prevsmallexp = '-';
      uncountablemode = m;
      bo = uncountablemodeinitnames[m] + (nlevels == 2 ? '' : ', nlevels = ' + nlevels);
      initlargeordinal = bo;
      //initlargeordinal='[c[[c[c!!!![[c[c!!!';
      //initlargeordinal='[c[[c[c!!!![[c[c!!![[c[c!!!';
      //initlargeordinal='[c[[c[c!!!![[c[[c[c!!!![c!!';
      list.innerHTML = '<li id="-" hidden></li>';
      let y = document.createElement('li');
      y.id = initlargeordinal;
      y.innerHTML = convert(initlargeordinal);

      //document.getElementById('-').insertAdjacentHTML('afterend',y.outerHTML);     // initial string at 1st ul level
      let x = document.createElement(ulnar[indentvisible]);                            // at 2nd ul level
      x.innerHTML = y.outerHTML;
      document.getElementById('-').insertAdjacentHTML('afterend', x.outerHTML);

      setmarkedli(document.getElementById(initlargeordinal));
      count = 1;
      counter.innerHTML = 'Counter: 1';
      window.scrollTo(0, 0);
      reset.style.opacity = 0.4;
      uncreset.innerHTML = 'Change mode';
      if (document.getElementById('res2') != null) {
         xs.style.background = '#fff';
         res1.style['font-style'] = 'italic';
         res2.style['font-weight'] = 'normal';
      }
      else if (document.getElementById('res3') != null)
         res3.innerHTML = 'Set ' + (uncountablemode ? '' : 'un') + 'countable mode and reset list';
      sugarbuttonupdate();
      mouseoverupdate();
   }

   function indentul0(c) {
      if (c.childElementCount < 1) {
         $(c).contents().unwrap();
         return;
      }
      if (c.childElementCount > 1) {
         $(c).wrapInner('<' + ulnar[indentvisible] + '>');
         c = c.firstChild;
         c.before(c.firstChild);
         if (c.previousSibling.tagName == ulnar[indentvisible]) {
            indentul0(c.previousSibling);
            $(c.previousSibling).contents().unwrap();
            indentul0(c);
            $(c).contents().unwrap();
         }
         else
            indentul0(c);
      }
   }

   let uncountablemode = 1;
   let uncountablemodeinitnames = ['Some large countable ordinal', 'Some large cardinal'];
   let bo = uncountablemodeinitnames[uncountablemode], col = 'c', eo = 0, efs = 0,
      //exp=['expansion','recursive expansion','double recursive expansion','triple recursive expansion','quadruple recursive expansion','quintuple recursive expansion','sextuple recursive expansion','septuple recursive expansion','octuple recursive expansion','ninefold recursive expansion'];
      //exp[-1]='collapse',exp[-2]='view';
      exp = ['Expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand'];
   exp[-1] = 'Collapse', exp[-2] = 'view';
   let count = 1, vt = true, pairb = [], pairl = [], exb = [], di = 5, fsl, fsn, fsp, lea, format = 1, ps = [];
   let countdifference, multicount;
   let mousex, mousey;
   let gtkey = 3, ltkey = 3;
   let processing = true;
   let indentmode = 0;
   let indentvisible = 1;
   let keytcheck = true;
   let mousetag, mousetagp;
   let fscurrent, fsopening, fsperiod0, fsperiod1, fsending, cofcurrent, cofclass, cardclass, fsarray;
   let fsprimer0, fsending0;
   let fsnumber = 1, fsopeningarray, fsperiodarray, fsendingarray;
   let cofclasslist = ['', 'zero', 'successor', 'regular cardinal', 'singular cardinal'];
   let cardclasslist = ['finite cardinal', 'countable', 'uncountable', 'countable cardinal', 'uncountable cardinal'];
   //let fsaltcheck;
   let cblen = 0, cbc = 0, cpn = 0;
   //let ulnar=['UL1','UL'];
   let ulnar = ['UL', 'UL'];
   let markedli;
   let prevsmallexp = '-', nextsmallexpn;
   let nextl, nextlb = false, mulcounter = 1;
   let nlevels = 2;
   let bolevels = 2;
   let leastr = 'c';
   let vero = 0;
   let spn = true;
   let subperiodpositionshift = 0;
   let leastuncountable = '[c!', leastepsilon = '[[c!!', leastepsilonbb = '[[[c!!!';
   let initlargeordinal = bo;
   let sugar = [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 35, 36, 37, 38, 39, 1, 0];
   let sugardefault = [[...sugar], [...sugar]];
   sugardefault[0][10] = 0;
   let sugarbuttoncolor = ['#d0e0ff', '#fff080', '#d0ffd0', '#d0ffff', '', '', '', '', '#ffff00', '#d0ffff', '#d0ffd0', '#d0ffd0', '#ffe0e0', '#fff0e0', '#d0ffd0', '#d0ffd0', '#d0ffd0', '#d0ffd0', '#d0ffd0', '#ffd0ff', '#ffd0ff', '#d0e0ff', '#d0e0ff', '#c0ffff', '#b0ffb0', '#ffe0e0', '#a0f0c0', '#fff000', '#fafa00', '#f0f040', '#f0f040', '#f0f040', '#f0f040', '#c0ffff', '#c0ffff', 35, 36, 37, 38, 39, '#ffd000', '#f0f040'];
   let sugarbuttonnumber = [1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1];
   let multiplicationsign = ['×', '·'];
   let propernames = ['Small Cantor ordinal', 'Cantor ordinal', 'Large Cantor ordinal', 'Feferman–Schütte ordinal', 'Ackermann ordinal', 'Small Veblen ordinal', 'Large Veblen ordinal', 'Second Large Veblen ordinal', 'Bachmann-Howard ordinal', 'Buchholz ordinal', 'Takeuti-Feferman-Buchholz ordinal', 'Bird ordinal', 'Extended Buchholz ordinal', 'Small Rathjen ordinal', 'Rathjen ordinal', 'Large Rathjen ordinal', 'Duchhardt ordinal'];
   let shortpropernames = ['', '', '', '', 'AO', 'SVO', 'LVO', 'SLVO', '<span style="color: #1900ff; font-weight: bold;">BHO</span>', 'BO', 'TFB', 'BiO', '', 'SRO', 'RO', 'LRO', 'DO'];
   let propernamestring = ['[[c!!', '[[c![[c!!!', '[[c![[c!![[c!!!', '[[c![[c![[c!!!!', '[[c![[c![[c!![[c!!!!', '[[c![[c![[c![!!!!', '[[c![[c![[c![[c!!!!!', '[[c![[c![[c![[c!!!![[c![[c![[c!!!!!', '[[c![c!!', '[[c[!!!', '[[c[!![c!!', '[[c[[c!!!!', '[[c[c!!!', '[[c[c!![c!!', '[[c[c[c!!![c!!', '[[c[c[c[c!!!![c!!', '[[c[c[c[c[c!!!!![c!!'];
   let modoldc = 0;
   let modc = 0;
   let modoldfraction;
   seteo(eo);

   /*
   let st='[[c!![[c!![[[c!![[c!!![[[c!![[c!!![[[c!![[[c!!!![[[c!![[[c!!!![[[c!![!![[[c!![!![[[c!!![[[c!!![[[c!!![[[!!![[[!!![[[!!![[![![![![!![[![![![!![[![![![!![[![![![!![![![![![!';
   list.innerHTML+=convert(st)+'<br/>';
   st=stringslice(st,'[!','[[c!![[c!!');
   list.innerHTML+=convert(st)+'<br/>';
   */

   function isSuccessor(str) { return str.endsWith("[!") }

   let ZERO = '';
   let Limit = bo

   function f(alpha, beta) {
      let n = 0;

      while (true) {
         const x = fs(beta, '', n);

         if (cmp(x, alpha) > 0) {
            return x;
         }

         n++;
      }
   }

   function g(alpha, beta, s) {
      while (true) {
         if (isSuccessor(beta)) return alpha;

         const split = f(alpha, beta);

         if (s === "") return split;

         const bit = s[0];
         s = s.slice(1);

         if (bit === "0") {
            beta = split;
         } else {
            alpha = split;
         }
      }
   }

   function gInv(alpha, beta, target) {
      let result = "";

      while (!isSuccessor(beta)) {
         const split = f(alpha, beta);
         const c = cmp(target, split);

         if (c === 0) break;

         if (c < 0) {
            result += "0";
            beta = split;
         } else {
            result += "1";
            alpha = split;
         }
      }

      return result;
   }

   function h(x, k = 0.5, maxlen = 100, eps = 1e-10) {
      let result = "";

      while (Math.abs(x - k) > eps && result.length < maxlen) {
         if (x < k) {
            result += "0";
            x = x / k;
         } else {
            result += "1";
            x = (x - k) / (1 - k);
         }
      }

      return result;
   }

   function hInv(s, k = 0.5) {
      let x = k;

      for (let i = s.length - 1; i >= 0; i--) {
         if (s[i] === "0") {
            x = k * x;
         } else {
            x = k + (1 - k) * x;
         }
      }

      return x;
   }

   return { fs, cmp, isSuccessor, convert, g, h, gInv, hInv, ZERO, Limit, f, sugar }
})();

let Lim_EcOCF_in_BMS = [[0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2]] // Lim(EcOCF) is (0,0,0,0)(1,1,1,1)(2,2,2,2) in BMS

function Conv_EcOCF_BMS(ord) {
   if (cOCF.cmp(ord, '[[c!!') == -1)
      return BMS.g(BMS.ZERO, [[0, 0], [1, 1]], EcOCF.gInv(EcOCF.ZERO, '[[c!!', ord));

   if (cOCF.cmp(ord, '[[c[!!!') == -1)
      return BMS.g([[0, 0], [1, 1]], [[0, 0, 0], [1, 1, 1]], EcOCF.gInv('[[c!!', '[[c[!!!', ord));

   if (cOCF.cmp(ord, 'c') == -1)
      return BMS.g([[0, 0, 0], [1, 1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1]], EcOCF.gInv('[[c[!!!', 'c', ord));

   return BMS.g([[0, 0, 0, 0], [1, 1, 1, 1]], Lim_EcOCF_in_BMS, EcOCF.gInv('c', EcOCF.Limit, ord));
}

function Conv_BMS_EcOCF(ord) {
   if (BMS.cmp(ord, [[0, 0], [1, 1]]) == -1)
      return EcOCF.g(EcOCF.ZERO, '[[c!!', BMS.gInv(BMS.ZERO, [[0, 0], [1, 1]], ord));

   if (BMS.cmp(ord, [[0, 0, 0], [1, 1, 1]]) == -1)
      return EcOCF.g('[[c!!', '[[c[!!!', BMS.gInv([[0, 0], [1, 1]], [[0, 0, 0], [1, 1, 1]], ord));

   if (BMS.cmp(ord, [[0, 0, 0, 0], [1, 1, 1, 1]]) == -1)
      return EcOCF.g('[[c[!!!', 'c', BMS.gInv([[0, 0, 0], [1, 1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1]], ord));

   return EcOCF.g('c', EcOCF.Limit, BMS.gInv([[0, 0, 0, 0], [1, 1, 1, 1]], Lim_EcOCF_in_BMS, ord));
}


let Lim__ECOCF_in_BMS = 'Limit' // Lim(_ECOCF) is Lim(BMS)

function Conv__ECOCF_BMS(ord) {
   if (EcOCF.cmp(ord, '[[c!!') == -1)
      return BMS.g(BMS.ZERO, [[0, 0], [1, 1]], EcOCF.gInv(EcOCF.ZERO, '[[c!!', ord));

   if (EcOCF.cmp(ord, '[[c[!!!') == -1)
      return BMS.g([[0, 0], [1, 1]], [[0, 0, 0], [1, 1, 1]], EcOCF.gInv('[[c!!', '[[c[!!!', ord));

   if (EcOCF.cmp(ord, 'c') == -1)
      return BMS.g([[0, 0, 0], [1, 1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1]], EcOCF.gInv('[[c[!!!', 'c', ord));

   return BMS.g([[0, 0, 0, 0], [1, 1, 1, 1]], Lim__ECOCF_in_BMS, EcOCF.gInv('c', EcOCF.Limit, ord));
}

function Conv_BMS__ECOCF(ord) {
   if (BMS.cmp(ord, [[0, 0], [1, 1]]) == -1)
      return EcOCF.g(EcOCF.ZERO, '[[c!!', BMS.gInv(BMS.ZERO, [[0, 0], [1, 1]], ord));

   if (BMS.cmp(ord, [[0, 0, 0], [1, 1, 1]]) == -1)
      return EcOCF.g('[[c!!', '[[c[!!!', BMS.gInv([[0, 0], [1, 1]], [[0, 0, 0], [1, 1, 1]], ord));

   if (BMS.cmp(ord, [[0, 0, 0, 0], [1, 1, 1, 1]]) == -1)
      return EcOCF.g('[[c[!!!', 'c', BMS.gInv([[0, 0, 0], [1, 1, 1]], [[0, 0, 0, 0], [1, 1, 1, 1]], ord));

   return EcOCF.g('c', EcOCF.Limit, BMS.gInv([[0, 0, 0, 0], [1, 1, 1, 1]], Lim__ECOCF_in_BMS, ord));
}


function BMStoPMS(matrix) {
   const newMatrix = [];
   if (matrix.length === 0) return newMatrix;
   const cols = matrix[0].length;
   // Track the last row index (1-based) seen at each depth, per column.
   const lastAtDepth = Array.from({ length: cols }, () => new Map());
   for (let i = 0; i < matrix.length; i++) {
      const newRow = [];
      for (let j = 0; j < cols; j++) {
         const depth = matrix[i][j];
         if (depth === 0) {
            newRow[j] = 0;
         } else {
            const parentIndex = lastAtDepth[j].get(depth - 1);
            if (parentIndex == null) {
               throw new Error(
                  `Invalid BMS matrix at row ${i}, col ${j}`
               );
            }
            newRow[j] = (i + 1) - parentIndex;
         }
         lastAtDepth[j].set(depth, i + 1);
      }
      newMatrix[i] = newRow;
   }
   return newMatrix;
}

function PMStoBMS(matrix) {
   const rows = matrix.length;
   if (rows === 0) return [];

   const cols = matrix[0].length;
   const result = Array.from({ length: rows }, () => Array(cols).fill(0));

   for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
         const dist = matrix[i][j];

         if (dist === 0) {
            result[i][j] = 0;
         } else {
            const parent = i + 1 - dist; // 1-based row index

            if (parent <= 0)
               throw new Error(`Invalid PMS at row ${i}, col ${j}`);

            result[i][j] = result[parent - 1][j] + 1;
         }
      }
   }

   return result;
}

function PMStoAMS(matrix) {
   return matrix.map((row, i) => row.map(v => v == 0 ? 0 : i + 1 - v));
}

function AMStoPMS(matrix) {
   return matrix.map((row, i) =>
      row.map(v => v === 0 ? 0 : (i + 1) - v)
   );
}

function AMSto0Y(matrix) {
   let a = Array(matrix.length).fill(1);
   for (let y = matrix[0].length - 1; y >= 0; y--) {
      for (let x = 0; x < matrix.length; x++) {
         a[x] = matrix[x][y] === 0 ? 1 : a[x] + a[matrix[x][y] - 1];
      }
   }
   return a;
}

function PMStoVZ(matrix) {
   const sequence = [];

   for (let i = 0; i < matrix.length; i++) {
      const row = [];

      for (let j = 0; j < matrix[i].length; j++) {
         let height = -1;
         let index = i + 1;

         while (index > 0) {
            height++;
            index -= (matrix[index - 1][j] || index);
         }

         row.push(height);
      }

      while (row.length > 1 && row.at(-1) === 0) row.pop();

      const v = row[0] + 1;
      sequence.push(v);

      for (let j = 1; j < row.length; j++) {
         sequence.push(v + row[j] + 1);
      }
   }

   return sequence.join(",");
}

function trimStringList(str, n) {
   if (n === 0) return str;

   return str
      .split(",")
      .slice(0, n)
      .join(",");
}

function trimArrayList(arr, n) {
   if (n === 0) return arr;

   return arr.slice(0, n)
}

// note that the correspondance is unproven

var itemSeparatorRegex = /[\t ,]/g;

function parseSequenceElement(s, i) {
   if (s.indexOf("v") == -1 || !isFinite(Number(s.substring(s.indexOf("v") + 1)))) {
      var numval = Number(s);
      return {
         value: numval,
         position: i,
         parentIndex: -1
      };
   } else {
      return {
         value: Number(s.substring(0, s.indexOf("v"))),
         position: i,
         parentIndex: Math.max(Math.min(i - 1, Number(s.substring(s.indexOf("v") + 1))), -1),
         forcedParent: true
      };
   }
}

function calcMountain(s) {
   var lastLayer;
   lastLayer = s.map(x => x.toString()).map(parseSequenceElement);
   var calculatedMountain = [lastLayer]; // rows
   while (true) {
      // assign parents
      var hasNextLayer = false;
      for (var i = 0; i < lastLayer.length; i++) {
         if (lastLayer[i].forcedParent) {
            if (lastLayer[i].parentIndex != -1) hasNextLayer = true;
            continue;
         }
         var p;
         if (calculatedMountain.length == 1) {
            p = lastLayer[i].position + 1;
         } else {
            p = 0;
            while (calculatedMountain[calculatedMountain.length - 2][p].position < lastLayer[i].position + 1) p++;
         }
         while (true) {
            if (p < 0) break;
            var j;
            if (calculatedMountain.length == 1) {
               p--;
               j = p - 1;
            } else { // ignoring
               p = calculatedMountain[calculatedMountain.length - 2][p].parentIndex;
               if (p < 0) break;
               j = 0;
               while (lastLayer[j].position < calculatedMountain[calculatedMountain.length - 2][p].position - 1) j++;
            }
            if (j < 0 || j < lastLayer.length - 1 && lastLayer[j].position + 1 != lastLayer[j + 1].position) break;
            if (lastLayer[j].value < lastLayer[i].value) {
               lastLayer[i].parentIndex = j;
               hasNextLayer = true;
               break;
            }
         }
      }
      if (!hasNextLayer) break;
      var currentLayer = [];
      calculatedMountain.push(currentLayer);
      for (var i = 0; i < lastLayer.length; i++) {
         if (lastLayer[i].parentIndex != -1) {
            currentLayer.push({ value: lastLayer[i].value - lastLayer[lastLayer[i].parentIndex].value, position: lastLayer[i].position - 1, parentIndex: -1 });
         }
      }
      lastLayer = currentLayer;
   }
   return calculatedMountain;
}

function Y_to_DBMS(s) {
   if (typeof s == "string") s = s.split(",");
   var mountain;
   mountain = calcMountain(s);
   var matrix = [];
   for (var i = 0; i < mountain[0].length; i++) matrix.push([]);
   for (var h = 0; h < mountain.length; h++) {
      for (var i = 0; i < mountain[h].length; i++) {
         matrix[mountain[h][i].position + h][h] = mountain[h][i].parentIndex == -1 ? 0 : matrix[mountain[h][mountain[h][i].parentIndex].position + h][h] + 1;
      }
   }
   for (var i = 0; i < mountain[0].length; i++) {
      while (matrix[i][matrix[i].length - 1] === 0 && matrix[i].length > 1) matrix[i].pop();
   }
   return matrix;
}

/*
Pipeline : BMS <-> PMS <-> AMS -> 0Y
                        -> Vulcaniz
*/
let Y_Terms = 0
let BMS_Terms = 0
let compress_BMS = false
let format_cOCF = true

function convert_From_wY(ord, mode) {
   if (ord == "Limit") return "Lim(&omega;-Y)"
   if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') > -1 || !convert_enabled) {
      return "&omega;-Y(" + ord + ")"
   }

   ord = trimStringList(ord, Y_Terms);

   if (mode == "wY") {
      return ord;
   }

   if (mode == "BMS") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') == -1) {
         if (compress_BMS)
            return Conv_Y_sequence_BMS(ord).map(p => `(${p.join(',').replace(/(,?0)*$/, '')})`).join('')
         else
            return Conv_Y_sequence_BMS(ord).map(p => `(${p.join(',')})`).join('');
      }
      if (ord == '1,3') return 'Lim(BMS)'
      return ord;
   }

   if (mode == "DBMS") {
      if (Y_Sequence.cmp(ord, '1,3') == -1) {
         if (typeof ord == 'string') ord = ord.split(',')
         if (compress_BMS)
            return Y_to_DBMS(ord).map(p => `(${p.join(',').replace(/(,?0)*$/, '')})`).join('')
         else
            return Y_to_DBMS(ord).map(p => `(${p.join(',')})`).join('');
      }
      if (ord == '1,3') return 'Lim(BMS)'
      return ord;
   }

   if (mode == "2-shifted OCF") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,13') == -1) {
         return Conv_BMS_OCF(trimArrayList(Y_to_DBMS(ord), BMS_Terms));
      }
      return ord;
   }

   if (mode == "cOCF") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,26') == -1) {
         if (format_cOCF)
            return cOCF.convert(Conv_BMS_cOCF(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms)));
         else
            return Conv_BMS_cOCF(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms));
      }
      return ord;
   }

   if (mode == "EcOCF") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,31') == -1) {
         if (format_cOCF)
            return EcOCF.convert(Conv_BMS_EcOCF(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms)));
         else
            return Conv_BMS_EcOCF(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms));
      }
      return ord;
   }

   if (mode == "BcOCF") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') == -1) {
         if (format_cOCF)
            return EcOCF.convert(Conv_BMS__ECOCF(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms)));
         else
            return Conv_BMS__ECOCF(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms));
      }
      return ord;
   }

   if (mode == "PMS") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') == -1) {
         if (compress_BMS.checked)
            return BMStoPMS(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms)).map(p => `(${p.join(',').replace(/(,?0)*$/, '')})`).join('')
         else
            return trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms).map(p => `(${p.join(',')})`).join('');
      }
      if (ord == '1,3') return 'Lim(PMS) / Lim(BMS)'
      return ord;
   }

   if (mode == "AMS") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') == -1) {
         if (compress_BMS.checked)
            return PMStoAMS(BMStoPMS(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms))).map(p => `(${p.join(',').replace(/(,?0)*$/, '')})`).join('')
         else
            return trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms).map(p => `(${p.join(',')})`).join('');
      }
      if (ord == '1,3') return 'Lim(AMS) / Lim(BMS)'
      return ord;
   }

   if (mode == "0Y") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') == -1) {
         return AMSto0Y(PMStoAMS(BMStoPMS(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms)))).join(',')
      }
      if (ord == '1,3') return 'Lim(0Y) / Lim(BMS)'
      return ord;
   }

   if (mode == "Vulcaniz") {
      if (Y_Sequence.cmp(ord, '1,2,4,8,16,32,64,128,256,512') == -1) {
         return PMStoVZ(BMStoPMS(trimArrayList(Conv_Y_sequence_BMS(ord), BMS_Terms)))
      }
      if (ord == '1,3') return 'Lim(Vulcaniz) / Lim(BMS)'
      return ord;
   }
}

