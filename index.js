'use strict';

var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');

var Transaction = bitcore.Transaction;
var Unit = bitcore.Unit;
var $ = bitcore.util.preconditions;

var main = 'mzcc1oA5Aw4EfBvveKm8NEmZ93U9VFu3x3';
var pk = 'cN76gKEk9w6rALN7gqEc9PNshgSQUXr4nTHybHZAibo1meewp2uE';
var desiredAmount = Unit.fromBTC(0.01).toSatoshis();
var MAX_SPEND = Unit.fromBTC(0.001).toSatoshis();
var fee = Unit.fromBTC(0.001).toSatoshis();

var network = 'testnet';
var insight = new explorers.Insight(network);
var difficulty = Math.pow(2, 240);

console.log('difficulty', difficulty);

var transact = function() {

  insight.getUnspentUtxos(main, function(err, utxos) {
    if (err) {
      throw err;
    }
    $.checkState(utxos.length > 0, main + ' should contain utxos');

    var bestHash = null;
    var mining = true;
    while (mining) {

      var satoshis = desiredAmount + Math.floor(Math.random() * MAX_SPEND);

      var tx = new Transaction()
        .change(main)
        .from(utxos)
        .to(main, satoshis)
        .fee(fee)
        .sign(pk);

      var hashValue = parseInt(tx.hash, 16);
      if (bestHash === null || hashValue < bestHash) {
        bestHash = hashValue;
        console.log(tx.id, bestHash);
        if (bestHash < difficulty) {
          console.log('will broadcast', tx.id);
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
