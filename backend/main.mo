import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

actor {
  stable var highScores : [(Nat, Nat)] = [];

  public func addScore(score : Nat, time : Nat) : async () {
    highScores := Array.sort(Array.append(highScores, [(score, time)]), func (a : (Nat, Nat), b : (Nat, Nat)) : {#less; #equal; #greater} {
      if (a.0 > b.0) {
        #less
      } else if (a.0 < b.0) {
        #greater
      } else if (a.1 < b.1) {
        #less
      } else if (a.1 > b.1) {
        #greater
      } else {
        #equal
      }
    });
    if (Array.size(highScores) > 10) {
      highScores := Array.subArray(highScores, 0, 10);
    };
  };

  public query func getHighScores() : async [(Nat, Nat)] {
    highScores
  };
}
