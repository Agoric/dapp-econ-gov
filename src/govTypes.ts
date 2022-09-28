import { Amount, Brand } from '@agoric/ertp';
import { Ratio } from '@agoric/zoe/src/contractSupport';

// Endo with boardId marshaling
export type Remotable = { boardId: string; iface?: string };

// Zoe
type Timer = Remotable;
type Instance = Remotable;
type Installation = Remotable;
type Handle<H extends string> = H & Record<string, never>;

// '@agoric/governance/src/types.js'
type ElectionType = 'param_change' | 'offer_filter';
type QuorumRule = 'majority' | 'all' | 'no_quorum';
type ChoiceMethod = 'unranked' | 'order';
type Timestamp = bigint;
type ClosingRule = {
  timer: Timer;
  deadline: Timestamp;
};

type ParamValue =
  | Amount
  | Brand
  | Installation
  | Instance
  | bigint
  | Ratio
  | string
  | unknown;
type ChangeParamsPosition = Record<string, ParamValue>;
type NoChangeParamsPosition = { noChange: string[] };
type ParamChangePositions = {
  positive: ChangeParamsPosition;
  negative: NoChangeParamsPosition;
};
export type ParamChangesSpec<P = StandardParamPath> = {
  paramPath: P;
  changes: Record<string, ParamValue>;
};
type StandardParamPath = { key: string };
type ParamChangeIssue<P = StandardParamPath> = {
  spec: ParamChangesSpec<P>;
  contract: Instance;
};

type OfferFilterPosition = { strings: string[] };
type NoChangeOfferFilterPosition = { dontUpdate: string[] };
type OfferFilterIssue = { strings: string[] };

export type ParamChangeSpec = {
  electionType: 'param_change';
  issue: ParamChangeIssue;
  positions: ParamChangePositions;
  tieOutcome: ChangeParamsPosition;
};
export type OfferFilterSpec = {
  electionType: 'offer_filter';
  issue: OfferFilterIssue;
  positions: (OfferFilterPosition | NoChangeOfferFilterPosition)[];
  tieOutcome: OfferFilterPosition | NoChangeOfferFilterPosition;
};
type QuestionSpec = (ParamChangeSpec | OfferFilterSpec) & {
  method: ChoiceMethod;
  maxChoices: number;
  closingRule: ClosingRule;
  quorumRule: QuorumRule;
};

export type QuestionDetails = QuestionSpec & {
  counterInstance: Instance; // instance of the VoteCounter
  questionHandle: Handle<'Question'>;
};

export type OutcomeRecord<ET extends ElectionType = ElectionType> = {
  question: Handle<'Question'>;
} & (
  | {
      outcome: 'win';
      position: ET extends 'param_change'
        ? ChangeParamsPosition
        : OfferFilterPosition;
    }
  | { outcome: 'fail'; reason: 'No quorum' }
);
