/* annotations/index.js
 * 汇总各朝代详注模块，对外暴露一个以诗 id 为键的对象：
 *   { [id]: { note, appreciation, translation } }
 * build-dataset.js 会按 id 合并进 poems.json。
 */
var ANN = {};
function merge(mod) {
  if (!mod) return;
  for (var k in mod) {
    if (Object.prototype.hasOwnProperty.call(mod, k)) ANN[k] = mod[k];
  }
}
merge(require('./tang-a'));
merge(require('./tang-b'));
merge(require('./song'));
merge(require('./shijing'));
merge(require('./yuan-other'));

module.exports = ANN;
