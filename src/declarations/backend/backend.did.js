export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getText' : IDL.Func([], [IDL.Text], ['query']),
    'setText' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
