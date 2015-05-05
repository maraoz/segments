'use strict';

var bitcore = require('bitcore');
var Transaction = bitcore.Transaction;
var Unit = bitcore.Unit;

var main = 'mpGVxP8nrX446XgRa7YhCFaLj3ShmkiMYn';
var pk = 'cQ8e5gjMf7dz7b87fo6UygDw2GztBHjn3qa8PBwjYY4ApMKwMM4P';
var utxos = [{
  address: main,
  txid: '88f1d64701336bd5c71e8cf99b07c70075fded0be13e574fe2a0b068b4d24cc5',
  outputIndex: 1,
  scriptPubKey: '76a9145ffd525ef01e229497e56b189fdd2a42bd36ba6688ac',
  amount: 1,
}];


var best = null;
var bestHash = null;

var desiredAmount = Unit.fromBTC(0.01).toSatoshis();
var MAX_SPEND = Unit.fromBTC(0.001).toSatoshis();
var fee = Unit.fromBTC(0.001).toSatoshis();

while (true) {

  var satoshis = desiredAmount + Math.floor(Math.random() * MAX_SPEND);

  var tx = new Transaction()
    .change(main)
    .from(utxos)
    .to(main, satoshis)
    .fee(fee)
    .sign(pk);

  var hashValue = parseInt(tx.hash, 16);
  if (best === null || hashValue < bestHash) {
    best = tx;
    bestHash = hashValue;
    console.log(tx.id, bestHash);
    console.log(tx.toObject());
    console.log(tx);
    console.log('*************************************');
  }

}
