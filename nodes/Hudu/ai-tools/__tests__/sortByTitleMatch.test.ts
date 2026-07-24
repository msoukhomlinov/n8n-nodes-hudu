import { describe, it, expect } from 'vitest';
import {
  sortByTitleMatch,
  titleMatchScore,
  isConfidentTitleMatch,
  TITLE_SUBSTRING_BOOST,
} from '../result-processor';

describe('titleMatchScore', () => {
  it('scores an exact substring match at or above TITLE_SUBSTRING_BOOST', () => {
    const score = titleMatchScore('MFA Office365', 'MFA Office365');
    expect(score).toBeGreaterThanOrEqual(TITLE_SUBSTRING_BOOST);
  });

  it('scores a non-substring match below TITLE_SUBSTRING_BOOST', () => {
    const score = titleMatchScore('How to reset a password', 'MFA Office365');
    expect(score).toBeLessThan(TITLE_SUBSTRING_BOOST);
  });

  it('does not award the tier-1 boost for a single token buried inside an unrelated word', () => {
    // 'it' is a substring of 'Digital' ("dig-it-al") but must not count as a whole-word tier-1 hit.
    const score = titleMatchScore('Digital Onboarding Migration Guide', 'IT');
    expect(score).toBeLessThan(TITLE_SUBSTRING_BOOST);
  });

  it('does not award the tier-1 boost for a 2-letter token against an unrelated possessive word (its ≠ it + plural s)', () => {
    // 'its' is a distinct word, not the plural of 'it' — the plural-s allowance must not bridge them.
    const score = titleMatchScore('Its onboarding checklist', 'IT');
    expect(score).toBeLessThan(TITLE_SUBSTRING_BOOST);
  });

  it('does not throw and returns a non-negative score for an all-stopword query', () => {
    const score = titleMatchScore('How to reset a password', 'how to');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('awards the tier-1 substring boost when the title pluralizes the last query word', () => {
    // "Reset Password" is not a literal substring of "Reset Passwords", but the plural 's' is a
    // plain English pluralization and should still whole-word-match.
    const score = titleMatchScore('Reset Passwords', 'Reset Password');
    expect(score).toBeGreaterThanOrEqual(TITLE_SUBSTRING_BOOST);
  });
});

describe('isConfidentTitleMatch', () => {
  it('is confident on a full-query substring match (tier 1)', () => {
    expect(isConfidentTitleMatch('MFA Office365 Setup', 'MFA Office365')).toBe(true);
  });

  it('is confident on a reworded/reordered title where all distinctive tokens are present (tier 2)', () => {
    // Not a literal substring (word order differs), but every distinctive query token appears → confident.
    expect(isConfidentTitleMatch('How to Set Up MFA on Office365', 'Office365 MFA')).toBe(true);
  });

  it('is NOT confident on a partial distinctive-token overlap against an unrelated title (original bug)', () => {
    // 2 of 3 content tokens present → correctly ranked but not full coverage.
    expect(isConfidentTitleMatch('MFA Setup Notes', 'Office365 MFA Setup')).toBe(false);
  });

  it('is NOT confident when the query reduces to a single distinctive token (coincidence guard)', () => {
    // "the" is a stopword → one content token ("vpn"); it appears but the full query is not a
    // substring, so tier 1 misses and tier 2's 2-token floor blocks the lone-word coincidence.
    expect(isConfidentTitleMatch('Configuring the corporate VPN gateway', 'the VPN')).toBe(false);
  });

  it('treats "IT" as a content token, not the stopword "it" (acronym collision guard)', () => {
    // Reordered query is not a literal substring, so this only passes if 'it' survives
    // stopword-stripping as a distinctive token alongside 'glue'.
    expect(isConfidentTitleMatch('IT Glue Import Guide', 'Glue IT')).toBe(true);
  });

  it('does NOT match a short token against a substring buried inside an unrelated word (whole-word guard)', () => {
    // 'it' is a substring of 'Digital' ("dig-it-al"), but must not count as a whole-word hit —
    // otherwise an unrelated "Digital Onboarding Migration Guide" title would falsely score as
    // confident just because 'it' happens to appear mid-word. (The literal phrase "it onboarding"
    // is not a substring of the title either, so tier 1 can't mask a tier-2 regression here.)
    expect(isConfidentTitleMatch('Digital Onboarding Migration Guide', 'IT Onboarding')).toBe(false);
  });

  it('is NOT confident on a single-token query that only substring-matches mid-word (tier-1 whole-word guard)', () => {
    // Without a whole-word boundary on tier 1, 'IT' would substring-match inside "Digital" and
    // short-circuit to confident before the tier-2 two-token floor ever runs.
    expect(isConfidentTitleMatch('Digital Onboarding Migration Guide', 'IT')).toBe(false);
  });

  it('matches an underscore-separated title against a space-separated query (boundary/delimiter parity)', () => {
    // queryTokens splits the query on '_' as a delimiter, so the boundary check on the title side
    // must treat '_' as a boundary too — otherwise "mfa"/"office365" never whole-word-match inside
    // "MFA_Office365" and a genuinely matching title scores 0.
    expect(isConfidentTitleMatch('MFA_Office365', 'MFA Office365')).toBe(true);
  });

  it('is confident when the title pluralizes the query (singular query vs. plural title)', () => {
    expect(isConfidentTitleMatch('Reset Passwords', 'Reset Password')).toBe(true);
  });

  it('still does NOT match a short token buried inside an unrelated word after the plural allowance (regression guard)', () => {
    // 'it' must still fail against 'split' — the plural 's' allowance only tolerates a trailing
    // 's' immediately after the token, it does not loosen the left-hand boundary or permit other
    // trailing characters, so this mid-word case from rounds 2-4 must keep failing.
    expect(isConfidentTitleMatch('How to split a document', 'it')).toBe(false);
  });

  it('is NOT confident for a 2-letter acronym against an unrelated title containing the possessive "its" (plural-s collision guard)', () => {
    // 'its' is not the plural of 'it' — must not be treated as one via the trailing-s allowance.
    expect(isConfidentTitleMatch('Its onboarding checklist', 'IT')).toBe(false);
  });
});

describe('sortByTitleMatch', () => {
  it('promotes a distinctive-word match ahead of an unrelated title when the query is a long common-word-heavy sentence', () => {
    const items = [
      { name: 'How to change a password' },
      { name: 'MFA Office365' },
    ];
    const [top] = sortByTitleMatch(items, 'How to Set Up MFA on Office365');
    expect(top.name).toBe('MFA Office365');
  });

  it('returns a stable, non-empty order for an all-stopword query', () => {
    const items = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }];
    const result = sortByTitleMatch(items, 'how to');
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
});
