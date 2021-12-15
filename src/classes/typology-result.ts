import { RuleResult } from './rule-result';

export class TypologyResult {
  id = '';
  cfg = '';
  result = 0.0;
  ruleResults: RuleResult[] = [];
}
