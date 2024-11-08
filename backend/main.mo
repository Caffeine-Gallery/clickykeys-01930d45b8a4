import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

actor {
  stable var storedText : Text = "";
  stable var highScores : [Nat] = [];

  public func setText(text : Text) : async () {
    storedText := text;
  };

  public query func getText() : async Text {
    storedText
  };

  public func addScore(score : Nat) : async () {
    highScores := Array.sort(Array.append(highScores, [score]), Nat.compare);
    if (Array.size(highScores) > 10) {
      highScores := Array.subArray(highScores, 0, 10);
    };
  };

  public query func getHighScores() : async [Nat] {
    highScores
  };
}
