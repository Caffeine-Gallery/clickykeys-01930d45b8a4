export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addScore' : IDL.Func([IDL.Nat], [], []),
    'getHighScores' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
    'getText' : IDL.Func([], [IDL.Text], ['query']),
    'setText' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
