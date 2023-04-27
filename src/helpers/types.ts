import * as slack_cons from "./slack_constants.js";

//Slack
export type ThreadInfo = { thread_ts: string; channel: string };
export type Command = (typeof slack_cons.Commands)[number];
export type CommandInfo = { name: string; criteria: Criteria | null };

//openpl
export type Criteria = (typeof slack_cons.CriteriaArr)[number];
export type Lift = (typeof slack_cons.Lifts)[number];
export type Person = {
  name: string;
  date: Date;
  meetname: string;
  division: string;
  weightclasskg: string;
  bodyweightkg: string;
  place: string;
  dots: number;
  best3squatkg: number;
  best3benchkg: number;
  best3deadliftkg: number;
  totalkg: number;
};
export type PersonShort = {
  name: string;
  date: Date;
  meetname: string;
  division: string;
  weightclasskg: string;
  totalkg: number;
};
