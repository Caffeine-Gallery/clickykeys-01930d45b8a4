import Int "mo:base/Int";

import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Random "mo:base/Random";
import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";
import Char "mo:base/Char";

actor {
  stable var highScores : [(Nat, Nat)] = [];

  let easyWords = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "cat", "mouse", "bird", "fish"];
  let mediumWords = ["computer", "keyboard", "monitor", "internet", "software", "hardware", "programming", "developer", "algorithm", "database"];
  let hardWords = ["cryptocurrency", "blockchain", "artificial", "intelligence", "quantum", "computing", "cybersecurity", "virtualization", "microservices", "containerization"];

  let easyPhrases = [
    "The sun is shining brightly today.",
    "I love to eat ice cream in summer.",
    "Reading books is a great hobby.",
    "Cats make wonderful pets for many people.",
    "Exercise is important for good health."
  ];

  let mediumPhrases = [
    "The Internet of Things is revolutionizing how we interact with devices.",
    "Artificial Intelligence is becoming increasingly important in various industries.",
    "Cloud computing has transformed the way businesses store and process data.",
    "Cybersecurity is a critical concern in our interconnected world.",
    "Renewable energy sources are crucial for a sustainable future."
  ];

  let hardPhrases = [
    "Quantum computing has the potential to solve complex problems exponentially faster than classical computers.",
    "Blockchain technology offers a decentralized and transparent way to record transactions and store data.",
    "Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions.",
    "The development of autonomous vehicles presents both opportunities and challenges for transportation.",
    "Genetic engineering and CRISPR technology are revolutionizing the field of medicine and biotechnology."
  ];

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

  public func getRandomSentence(difficulty : Text, level : Nat) : async Text {
    let seed = await Random.blob();
    let rng = Random.Finite(seed);
    
    func randomElement<T>(arr : [T]) : T {
      let index = switch (rng.range(Nat8.fromNat(arr.size()))) {
        case (null) { 0 };
        case (?val) { val };
      };
      arr[index]
    };

    func generateSentence(words : [Text], length : Nat) : Text {
      let sentence = Array.tabulate<Text>(length, func(_ : Nat) : Text { randomElement(words) });
      let firstWord = Text.map(sentence[0], func (c : Char) : Char {
        if (Char.isLowercase(c)) {
          Char.fromNat32(Char.toNat32(c) - 32)
        } else {
          c
        }
      });
      Text.join(" ", Iter.fromArray(Array.append([firstWord], Array.subArray(sentence, 1, length - 1)))) # "."
    };

    switch (difficulty) {
      case "easy" {
        if (level <= 2) {
          randomElement(easyPhrases)
        } else {
          generateSentence(easyWords, 5 + level)
        }
      };
      case "medium" {
        if (level <= 2) {
          randomElement(mediumPhrases)
        } else {
          generateSentence(Array.append(easyWords, mediumWords), 8 + level)
        }
      };
      case "hard" {
        if (level <= 2) {
          randomElement(hardPhrases)
        } else {
          generateSentence(Array.append(Array.append(easyWords, mediumWords), hardWords), 10 + level)
        }
      };
      case _ { "Invalid difficulty level." };
    }
  };
}
