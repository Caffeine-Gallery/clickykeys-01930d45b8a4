import Text "mo:base/Text";

actor {
  stable var storedText : Text = "";

  public func setText(text : Text) : async () {
    storedText := text;
  };

  public query func getText() : async Text {
    storedText
  };
}
