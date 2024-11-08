export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addScore' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'getHighScores' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
