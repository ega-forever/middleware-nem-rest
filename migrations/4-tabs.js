
module.exports.id = '4.tabs';

/**
 * @description flow tabs update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.update({"path":"tabs","type":"flows"}, {
    $set: {"path":"tabs","body":[{"id":"2c9dd332.05334c","type":"tab","label":"address","disabled":false,"info":""},{"id":"b9bb278f.4505f8","type":"tab","label":"tx","disabled":false,"info":""}]}
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({"path":"tabs","type":"flows"}, done);
};
