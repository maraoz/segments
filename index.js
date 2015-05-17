'use strict';

var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');

var Transaction = bitcore.Transaction;
var Unit = bitcore.Unit;
var $ = bitcore.util.preconditions;

var main = 'mzcc1oA5Aw4EfBvveKm8NEmZ93U9VFu3x3';
var pk = 'cN76gKEk9w6rALN7gqEc9PNshgSQUXr4nTHybHZAibo1meewp2uE';
var desiredAmount = Unit.fromBTC(0.01).toSatoshis();
var MAX_SPEND = Unit.fromBTC(0.01).toSatoshis();
var fee = Unit.fromBTC(0.001).toSatoshis();

var network = 'testnet';
var insight = new explorers.Insight(network);
var difficulty = Math.pow(2, 245);

console.log('difficulty', difficulty);
console.log('search space size', MAX_SPEND);
console.log('address', main);

var transact = function() {

  insight.getUnspentUtxos(main, function(err, utxos) {
    if (err) {
      throw err;
    }
    $.checkState(utxos.length > 0, main + ' should contain utxos');

    var bestHash = null;
    var mining = true;
    var delta = 0;
    while (mining) {
      delta += 1;
      $.checkState(delta < MAX_SPEND, 'Couldnt find satisfying tx in all search space.');
      var satoshis = desiredAmount + delta;

      var tx = new Transaction()
        .change(main)
        .from(utxos)
        .to(main, satoshis)
        .fee(fee);
      tx.sign(pk);

      var hashValue = parseInt(tx.hash, 16);
      if (bestHash === null || hashValue < bestHash) {
        bestHash = hashValue;
        console.log(tx.id, bestHash);
        if (bestHash < difficulty) {
          console.log('will broadcast', tx.id);
          console.log(tx);
          console.log(tx.serialize());
          insight.broadcast(tx, function(err, txid) {
            if (err) {
              throw err;
            }
            console.log('broadcasted', txid);
            console.log('*************************************');
            setTimeout(transact, 1000);
          });
          mining = false;
        }
      }

    }

  });
};

transact();
