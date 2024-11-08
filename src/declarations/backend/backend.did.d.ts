import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addScore' : ActorMethod<[bigint, bigint], undefined>,
  'getHighScores' : ActorMethod<[], Array<[bigint, bigint]>>,
  'getRandomSentence' : ActorMethod<[string, bigint], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
